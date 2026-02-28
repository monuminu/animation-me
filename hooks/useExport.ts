'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'

/**
 * useExport — Recording bridge hook for headless MP4/WebM export.
 *
 * Sets up `window.startRecording` / `window.stopRecording` bridge functions
 * that external recording tools (Puppeteer, Playwright, etc.) can call.
 *
 * In export mode:
 * - Auto-plays animation on mount
 * - Stops playback after one complete pass (if `singlePass` is true)
 * - Calls registered onStart/onStop callbacks
 *
 * Usage:
 * ```tsx
 * const { isRecording, hasEnded } = useExport({ singlePass: true })
 * ```
 */

interface UseExportOptions {
  /** Whether to automatically stop playback after one complete pass. Default: false */
  singlePass?: boolean
  /** Whether to auto-play on mount (export mode). Default: false */
  autoPlay?: boolean
}

interface UseExportReturn {
  /** Whether recording is currently active */
  isRecording: boolean
  /** Whether the animation has completed at least one full pass */
  hasEnded: boolean
  /** Register a callback for when recording starts */
  setOnStart: (cb: () => void) => void
  /** Register a callback for when recording stops */
  setOnStop: (cb: () => void) => void
}

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const { singlePass = false, autoPlay = false } = options
  const onStartRef = useRef<(() => void) | null>(null)
  const onStopRef = useRef<(() => void) | null>(null)

  const recording = useProjectStore((s) => s.recording)
  const setRecording = useProjectStore((s) => s.setRecording)
  const setPlayback = useProjectStore((s) => s.setPlayback)
  const animationConfig = useProjectStore((s) => s.animationConfig)

  // Set up window bridge functions
  useEffect(() => {
    window.startRecording = () => {
      setRecording({ isRecording: true, hasStarted: true })
      onStartRef.current?.()
    }
    window.__animationMe_startRecording = window.startRecording

    window.stopRecording = () => {
      setRecording({ isRecording: false, hasEnded: true })
      onStopRef.current?.()
      if (singlePass) {
        setPlayback({ isPlaying: false })
      }
    }
    window.__animationMe_stopRecording = window.stopRecording

    return () => {
      delete window.startRecording
      delete window.stopRecording
      delete window.__animationMe_startRecording
      delete window.__animationMe_stopRecording
    }
  }, [singlePass, setRecording, setPlayback])

  // Auto-play on mount in export mode
  useEffect(() => {
    if (autoPlay && animationConfig) {
      setPlayback({
        isPlaying: true,
        currentTime: 0,
        currentSceneIndex: 0,
      })
    }
  }, [autoPlay, animationConfig, setPlayback])

  // Stop playback when singlePass completes
  useEffect(() => {
    if (singlePass && recording.hasEnded) {
      setPlayback({ isPlaying: false })
    }
  }, [singlePass, recording.hasEnded, setPlayback])

  const setOnStart = useCallback((cb: () => void) => {
    onStartRef.current = cb
  }, [])

  const setOnStop = useCallback((cb: () => void) => {
    onStopRef.current = cb
  }, [])

  return {
    isRecording: recording.isRecording,
    hasEnded: recording.hasEnded,
    setOnStart,
    setOnStop,
  }
}
