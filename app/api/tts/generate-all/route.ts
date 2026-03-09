import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { parseBuffer } from 'music-metadata'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'narration-audio')

interface SceneInput {
  id: string
  narration: string
}

interface SceneResult {
  sceneId: string
  filePath: string
  durationMs: number
  audioUrl: string
  status: 'success' | 'error'
  error?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return (error as { statusCode: number }).statusCode === 409
  }
  return false
}

/**
 * Ensure the storage directory exists.
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

/**
 * Generate TTS audio for a single scene text, with retry logic.
 */
async function generateSingleTTS(
  client: ElevenLabsClient,
  voiceId: string,
  text: string
): Promise<Buffer> {
  let lastError: unknown = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text: text.trim(),
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      })

      const reader = audioStream.getReader()
      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) chunks.push(value)
      }

      return Buffer.concat(chunks)
    } catch (error) {
      lastError = error
      if (isRetryableError(error) && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        console.warn(
          `TTS 409 conflict (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms...`
        )
        await sleep(delay)
        continue
      }
      break
    }
  }

  throw lastError
}

/**
 * Measure MP3 duration in milliseconds using music-metadata.
 */
async function measureDuration(buffer: Buffer): Promise<number> {
  const metadata = await parseBuffer(buffer, { mimeType: 'audio/mpeg' })
  const durationSec = metadata.format.duration ?? 0
  return Math.round(durationSec * 1000)
}

/**
 * POST /api/tts/generate-all
 *
 * Batch TTS generation endpoint. Processes scenes sequentially to avoid
 * ElevenLabs 409 conflicts. For each scene:
 *   1. Generate MP3 via ElevenLabs
 *   2. Save to storage/narration-audio/
 *   3. Measure duration via music-metadata
 *   4. Insert NarrationAudio row in Postgres
 *
 * Body: {
 *   projectId: string,
 *   voiceId?: string,
 *   scenes: [{ id: string, narration: string }]
 * }
 *
 * Returns: { results: SceneResult[] }
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { projectId, voiceId, scenes } = body as {
      projectId: string
      voiceId?: string
      scenes: SceneInput[]
    }

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "projectId"' },
        { status: 400 }
      )
    }

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "scenes" array' },
        { status: 400 }
      )
    }

    // Filter to only scenes with actual narration text
    const scenesWithNarration = scenes.filter(
      (s) => s.narration && s.narration.trim().length > 0
    )

    if (scenesWithNarration.length === 0) {
      return NextResponse.json({ results: [] })
    }

    ensureStorageDir()

    const client = new ElevenLabsClient({ apiKey })
    const resolvedVoiceId =
      voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

    // Delete existing NarrationAudio rows for this project (re-generation)
    await prisma.narrationAudio.deleteMany({
      where: { projectId },
    })

    // Clean up old files for this project
    const existingFiles = fs.readdirSync(STORAGE_DIR)
    for (const file of existingFiles) {
      if (file.startsWith(`${projectId}-`)) {
        try {
          fs.unlinkSync(path.join(STORAGE_DIR, file))
        } catch {
          // Ignore cleanup errors
        }
      }
    }

    const results: SceneResult[] = []

    // Process scenes sequentially to avoid ElevenLabs 409 conflicts
    for (const scene of scenesWithNarration) {
      try {
        // 1. Generate MP3
        const audioBuffer = await generateSingleTTS(
          client,
          resolvedVoiceId,
          scene.narration
        )

        // 2. Save to filesystem
        const fileName = `${projectId}-${scene.id}-${Date.now()}.mp3`
        const filePath = path.join(STORAGE_DIR, fileName)
        fs.writeFileSync(filePath, audioBuffer)

        // 3. Measure duration
        const durationMs = await measureDuration(audioBuffer)

        // 4. Insert NarrationAudio row
        await prisma.narrationAudio.create({
          data: {
            projectId,
            sceneId: scene.id,
            filePath: fileName, // Store just the filename, not full path
            durationMs,
            voiceId: resolvedVoiceId,
            text: scene.narration,
          },
        })

        // 5. Build result with serving URL
        const audioUrl = `/api/tts/serve/${encodeURIComponent(fileName)}`

        results.push({
          sceneId: scene.id,
          filePath: fileName,
          durationMs,
          audioUrl,
          status: 'success',
        })
      } catch (error) {
        console.error(`TTS error for scene ${scene.id}:`, error)
        results.push({
          sceneId: scene.id,
          filePath: '',
          durationMs: 0,
          audioUrl: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'TTS generation failed',
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Batch TTS generation error:', error)
    const message = error instanceof Error ? error.message : 'Batch TTS generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
