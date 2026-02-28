import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import os from 'os'
import type { AnimationConfig, ExportConfig } from '@/types'

export const runtime = 'nodejs'

// Cache the bundle path so subsequent exports skip bundling
let cachedBundlePath: string | null = null

/**
 * Map quality setting to CRF value (lower = higher quality, bigger file).
 * CRF 10 = near-lossless, 18 = visually lossless, 28 = smaller/lower quality
 */
function qualityToCrf(quality: 'low' | 'medium' | 'high'): number {
  switch (quality) {
    case 'low':
      return 28
    case 'medium':
      return 18
    case 'high':
      return 10
    default:
      return 18
  }
}

export async function POST(request: NextRequest) {
  let outputPath: string | null = null

  try {
    const body = await request.json()
    const { animationConfig, exportConfig } = body as {
      animationConfig: AnimationConfig
      exportConfig: ExportConfig
    }

    // Validate inputs
    if (!animationConfig || !animationConfig.scenes?.length) {
      return NextResponse.json(
        { error: 'Missing or invalid animationConfig' },
        { status: 400 }
      )
    }

    if (!exportConfig || !exportConfig.fps || !exportConfig.width || !exportConfig.height) {
      return NextResponse.json(
        { error: 'Missing or invalid exportConfig' },
        { status: 400 }
      )
    }

    // Dynamic imports — these are server-only modules
    const { bundle } = await import('@remotion/bundler')
    const { renderMedia, selectComposition } = await import('@remotion/renderer')
    const { webpackOverride } = await import('@/lib/remotion/webpack-override')

    // ── Step 1: Bundle (cached after first call) ──
    if (!cachedBundlePath || !fs.existsSync(cachedBundlePath)) {
      const entryPoint = path.resolve(process.cwd(), 'lib/remotion/entry.ts')

      cachedBundlePath = await bundle({
        entryPoint,
        webpackOverride,
      })
    }

    // ── Step 2: Select composition with inputProps ──
    const inputProps = {
      animationConfig,
      fps: exportConfig.fps,
      width: exportConfig.width,
      height: exportConfig.height,
    }

    const composition = await selectComposition({
      serveUrl: cachedBundlePath,
      id: 'animation',
      inputProps,
    })

    // ── Step 3: Render to temp file ──
    outputPath = path.join(
      os.tmpdir(),
      `animation-export-${Date.now()}.mp4`
    )

    await renderMedia({
      composition,
      serveUrl: cachedBundlePath,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
      crf: qualityToCrf(exportConfig.quality),
    })

    // ── Step 4: Return the MP4 file ──
    const fileBuffer = fs.readFileSync(outputPath)

    // Clean up temp file
    try {
      fs.unlinkSync(outputPath)
      outputPath = null
    } catch {
      // Non-critical — temp dir will clean up eventually
    }

    const sanitizedTitle = (animationConfig.title || 'animation')
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100) || 'animation'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${sanitizedTitle}.mp4"`,
        'Content-Length': String(fileBuffer.length),
      },
    })
  } catch (error) {
    console.error('Export render error:', error)

    // Clean up temp file on error
    if (outputPath) {
      try {
        fs.unlinkSync(outputPath)
      } catch {
        // Ignore cleanup errors
      }
    }

    const message =
      error instanceof Error ? error.message : 'Export rendering failed'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
