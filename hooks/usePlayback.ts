'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'

// Extend Window interface for recording bridge
declare global {
  interface Window {
    startRecording?: () => void
    stopRecording?: () => void
    __animationMe_startRecording?: () => void
    __animationMe_stopRecording?: () => void
  }
}

export function usePlayback() {
  const { playback, animationConfig, setPlayback } = useProjectStore()
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const hasSignaledStartRef = useRef<boolean>(false)
  const hasCompletedOnceRef = useRef<boolean>(false)
  const prevConfigRef = useRef<typeof animationConfig>(null)

  // Reset recording refs when animationConfig changes
  useEffect(() => {
    if (animationConfig !== prevConfigRef.current) {
      hasSignaledStartRef.current = false
      hasCompletedOnceRef.current = false
      prevConfigRef.current = animationConfig
    }
  }, [animationConfig])

  const tick = useCallback((timestamp: number) => {
    const state = useProjectStore.getState()
    const { playback: pb, animationConfig: config } = state

    if (!pb.isPlaying || !config) {
      lastTimeRef.current = 0
      return
    }

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }

    // Signal recording start on first play tick
    if (!hasSignaledStartRef.current) {
      hasSignaledStartRef.current = true
      try {
        window.startRecording?.()
        window.__animationMe_startRecording?.()
      } catch {
        // Silently ignore — recording bridge is optional
      }
      state.setRecording({ isRecording: true, hasStarted: true })
    }

    const delta = (timestamp - lastTimeRef.current) * pb.speed
    lastTimeRef.current = timestamp

    let newTime = pb.currentTime + delta

    // Loop back to start when done
    if (newTime >= pb.totalDuration) {
      // Signal recording stop on first complete pass
      if (!hasCompletedOnceRef.current) {
        hasCompletedOnceRef.current = true
        try {
          window.stopRecording?.()
          window.__animationMe_stopRecording?.()
        } catch {
          // Silently ignore
        }
        state.setRecording({ isRecording: false, hasEnded: true })
      }
      newTime = 0
    }

    // Determine current scene
    let elapsed = 0
    let sceneIndex = 0
    for (let i = 0; i < config.scenes.length; i++) {
      if (newTime < elapsed + config.scenes[i].duration) {
        sceneIndex = i
        break
      }
      elapsed += config.scenes[i].duration
      if (i === config.scenes.length - 1) {
        sceneIndex = i
      }
    }

    state.setPlayback({
      currentTime: newTime,
      currentSceneIndex: sceneIndex,
    })

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (playback.isPlaying && animationConfig) {
      lastTimeRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [playback.isPlaying, animationConfig, tick])

  const seekTo = useCallback((time: number) => {
    const config = useProjectStore.getState().animationConfig
    if (!config) return

    const clampedTime = Math.max(0, Math.min(time, config.totalDuration))

    let elapsed = 0
    let sceneIndex = 0
    for (let i = 0; i < config.scenes.length; i++) {
      if (clampedTime < elapsed + config.scenes[i].duration) {
        sceneIndex = i
        break
      }
      elapsed += config.scenes[i].duration
      if (i === config.scenes.length - 1) {
        sceneIndex = i
      }
    }

    setPlayback({
      currentTime: clampedTime,
      currentSceneIndex: sceneIndex,
    })
    lastTimeRef.current = 0
  }, [setPlayback])

  const hasEnded = useProjectStore((s) => s.recording.hasEnded)

  return { seekTo, hasEnded }
}
