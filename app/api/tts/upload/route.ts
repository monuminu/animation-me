import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const runtime = 'nodejs'

/**
 * POST /api/tts/upload
 * Accepts a multipart form with an audio file, saves it to a temp directory,
 * and returns the file path. Used by Remotion during server-side rendering
 * to access audio files via local file paths.
 *
 * Body: FormData with "audio" file and "sceneId" field
 * Returns: { filePath: string, sceneId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const sceneId = formData.get('sceneId') as string | null

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Missing "audio" file in form data' },
        { status: 400 }
      )
    }

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Missing "sceneId" field in form data' },
        { status: 400 }
      )
    }

    // Create a temp directory for narration audio files
    const tempDir = path.join(os.tmpdir(), 'animation-me-narration')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Write audio to temp file
    const fileName = `narration-${sceneId}-${Date.now()}.mp3`
    const filePath = path.join(tempDir, fileName)

    const arrayBuffer = await audioFile.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

    return NextResponse.json({
      filePath,
      sceneId,
    })
  } catch (error) {
    console.error('TTS upload error:', error)

    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
