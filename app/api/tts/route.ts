import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export const runtime = 'nodejs'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

/**
 * Sleep helper for retry backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if an error is a retryable ElevenLabs conflict (409 "already_running").
 */
function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return (error as { statusCode: number }).statusCode === 409
  }
  return false
}

/**
 * POST /api/tts
 * Converts text to speech using ElevenLabs TTS API.
 * Returns raw MP3 audio bytes.
 *
 * Includes retry with exponential backoff for 409 "already_running" conflicts,
 * which occur when concurrent requests hit the same voice.
 *
 * Body: { text: string, voiceId?: string }
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
    const { text, voiceId } = body as { text?: string; voiceId?: string }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "text" field' },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 }
      )
    }

    const client = new ElevenLabsClient({ apiKey })

    const resolvedVoiceId =
      voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB' // "Adam" default

    // Retry loop for transient 409 "already_running" errors
    let lastError: unknown = null
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const audioStream = await client.textToSpeech.convert(resolvedVoiceId, {
          text: text.trim(),
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
        })

        // Read the ReadableStream into a buffer
        const reader = audioStream.getReader()
        const chunks: Uint8Array[] = []
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) chunks.push(value)
        }
        const audioBuffer = Buffer.concat(chunks)

        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': String(audioBuffer.length),
          },
        })
      } catch (error) {
        lastError = error

        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt) // 1s, 2s, 4s
          console.warn(
            `TTS 409 conflict (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms...`
          )
          await sleep(delay)
          continue
        }

        // Non-retryable error or max retries exhausted — fall through
        break
      }
    }

    console.error('TTS generation error:', lastError)
    const message = lastError instanceof Error ? lastError.message : 'TTS generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  } catch (error) {
    console.error('TTS generation error:', error)

    const message = error instanceof Error ? error.message : 'TTS generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
