import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import os from 'os'
import type { AnimationConfig, ExportConfig } from '@/types'

export const runtime = 'nodejs'

// Cache the bundle path so subsequent exports skip bundling
let cachedBundlePath: string | null = null

/**
 * Map quality setting to target video bitrate string for Remotion/FFmpeg.
 *
 * We use `videoBitrate` (VBR target) instead of `crf` (constant rate factor)
 * because CRF lets the encoder decide the bitrate based on scene complexity.
 * Our animations are mostly flat colors/gradients/text on dark backgrounds,
 * so CRF produces very low bitrates (~1 Mbps) even at CRF 10 — resulting
 * in files far smaller than the user expects from their quality selection.
 *
 * With explicit videoBitrate, the encoder targets the specified rate and
 * the output file size matches the UI estimate.
 */
function qualityToBitrate(quality: 'low' | 'medium' | 'high'): string {
  switch (quality) {
    case 'low':
      return '2M'    // 2 Mbps
    case 'medium':
      return '5M'    // 5 Mbps
    case 'high':
      return '10M'   // 10 Mbps
    default:
      return '5M'
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

      // Use explicit bitrate targeting instead of CRF.
      // CRF lets the encoder decide bitrate based on complexity — our flat
      // color/gradient animations compress too well, producing ~1 Mbps even
      // at CRF 10. videoBitrate enforces the user's selected quality level.
      videoBitrate: qualityToBitrate(exportConfig.quality),

      // Use PNG for intermediate frames — lossless, avoids JPEG compression
      // artifacts in gradients, glows, and blur effects
      imageFormat: 'png',

      // Limit concurrency to avoid partial frame paints and ensure each frame
      // fully renders CSS blur/filter effects before capture
      concurrency: 2,

      // Ensure heavy CSS filters (blur, mix-blend-mode) finish compositing
      timeoutInMilliseconds: 60000,

      // Use YUV 4:2:0 pixel format for broad player compatibility
      pixelFormat: 'yuv420p',
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
