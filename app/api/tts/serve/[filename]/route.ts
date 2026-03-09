import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'narration-audio')

/**
 * GET /api/tts/serve/[filename]
 *
 * Serves MP3 files from storage/narration-audio/ by filename.
 * Validates path to prevent directory traversal attacks.
 * Sets Content-Type: audio/mpeg + cache headers.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    if (!filename) {
      return NextResponse.json(
        { error: 'Missing filename' },
        { status: 400 }
      )
    }

    // Prevent directory traversal attacks
    const sanitized = path.basename(filename)
    if (sanitized !== filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    // Only allow .mp3 files
    if (!sanitized.endsWith('.mp3')) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    const filePath = path.join(STORAGE_DIR, sanitized)

    // Verify the resolved path is still within STORAGE_DIR
    const resolvedPath = path.resolve(filePath)
    const resolvedStorageDir = path.resolve(STORAGE_DIR)
    if (!resolvedPath.startsWith(resolvedStorageDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'public, max-age=86400, immutable',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error) {
    console.error('Audio serve error:', error)
    const message = error instanceof Error ? error.message : 'Failed to serve audio'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
