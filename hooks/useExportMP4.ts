'use client'

import { useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { downloadMP4, sanitizeFilename } from '@/lib/export-utils'
import type { ExportConfig } from '@/types'

/**
 * useExportMP4 — Server-side Remotion export via API route.
 *
 * How it works:
 * 1. Sends animationConfig + exportConfig to /api/export
 * 2. The API route bundles & renders the animation with Remotion (server-side)
 * 3. Returns the MP4 file as a binary response
 * 4. Downloads the file to the user's machine
 *
 * Why this approach:
 * - No screen-share permission dialog
 * - Not real-time — a 20s animation renders as fast as the server can process frames
 * - Deterministic output — same input always produces same video
 * - Works in all browsers (rendering happens server-side with headless Chromium)
 */

interface UseExportMP4Return {
  exportMP4: (config: ExportConfig) => Promise<void>
  cancelExport: () => void
  isExporting: boolean
}

export function useExportMP4(): UseExportMP4Return {
  const abortControllerRef = useRef<AbortController | null>(null)
  const isExportingRef = useRef(false)

  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const exportMP4 = useCallback(async (config: ExportConfig) => {
    const store = useProjectStore.getState()
    const { animationConfig } = store

    if (!animationConfig || isExportingRef.current) return

    isExportingRef.current = true
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Pause normal playback
    store.setPlayback({ isPlaying: false })
    store.setIsExporting(true)
    store.setExportProgress({
      phase: 'preparing',
      currentFrame: 0,
      totalFrames: 0,
      percent: 5,
    })

    try {
      const totalFrames = Math.ceil((animationConfig.totalDuration / 1000) * config.fps)

      // ── Step 1: Send render request to API ──
      store.setExportProgress({
        phase: 'rendering',
        currentFrame: 0,
        totalFrames,
        percent: 10,
      })

      // Start a progress simulation since the API doesn't stream progress
      // The render typically takes a few seconds to a minute
      const progressInterval = setInterval(() => {
        const currentProgress = useProjectStore.getState().exportProgress
        if (
          currentProgress &&
          currentProgress.phase === 'rendering' &&
          currentProgress.percent < 85
        ) {
          // Gradually increase progress to give feedback
          const newPercent = currentProgress.percent + 1
          const newFrame = Math.round((newPercent / 100) * totalFrames)
          store.setExportProgress({
            phase: 'rendering',
            currentFrame: newFrame,
            totalFrames,
            percent: newPercent,
          })
        }
      }, 500)

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animationConfig,
          exportConfig: config,
        }),
        signal: abortController.signal,
      })

      clearInterval(progressInterval)

      if (abortController.signal.aborted) {
        store.setExportProgress(null)
        store.setIsExporting(false)
        isExportingRef.current = false
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Export failed with status ${response.status}`)
      }

      // ── Step 2: Encoding/finalizing ──
      store.setExportProgress({
        phase: 'encoding',
        currentFrame: totalFrames,
        totalFrames,
        percent: 90,
      })

      const arrayBuffer = await response.arrayBuffer()

      store.setExportProgress({
        phase: 'finalizing',
        currentFrame: totalFrames,
        totalFrames,
        percent: 95,
      })

      // ── Step 3: Download ──
      const filename = sanitizeFilename(animationConfig.title || 'animation')
      downloadMP4(arrayBuffer, `${filename}.mp4`)

      store.setExportProgress({
        phase: 'done',
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
      })
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled — clean up silently
        store.setExportProgress(null)
        store.setIsExporting(false)
        isExportingRef.current = false
        return
      }

      const message = error instanceof Error ? error.message : 'Export failed'
      console.error('Export error:', error)

      store.setExportProgress({
        phase: 'error',
        currentFrame: 0,
        totalFrames: 0,
        percent: 0,
        error: message,
      })
    } finally {
      store.setIsExporting(false)
      isExportingRef.current = false
      abortControllerRef.current = null
    }
  }, [])

  const isExporting = useProjectStore((s) => s.isExporting)

  return {
    exportMP4,
    cancelExport,
    isExporting,
  }
}
