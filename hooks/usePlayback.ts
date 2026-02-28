'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'

export function usePlayback() {
  const { playback, animationConfig, setPlayback } = useProjectStore()
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

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

    const delta = (timestamp - lastTimeRef.current) * pb.speed
    lastTimeRef.current = timestamp

    let newTime = pb.currentTime + delta

    // Handle end of animation
    if (newTime >= pb.totalDuration) {
      // Normal playback: loop back to start
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

  return { seekTo }
}
