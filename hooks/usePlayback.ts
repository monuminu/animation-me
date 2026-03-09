'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { getEffectiveSceneDuration } from '@/lib/scene-utils'

/**
 * Seek to a specific time (ms) in the animation.
 * Standalone function — does NOT start a rAF loop.
 * Safe to call from any component.
 */
export function seekToTime(time: number) {
  const state = useProjectStore.getState()
  const config = state.animationConfig
  if (!config) return

  const clampedTime = Math.max(0, Math.min(time, config.totalDuration))

  let elapsed = 0
  let sceneIndex = 0
  for (let i = 0; i < config.scenes.length; i++) {
    const effectiveDuration = getEffectiveSceneDuration(config.scenes[i])
    if (clampedTime < elapsed + effectiveDuration) {
      sceneIndex = i
      break
    }
    elapsed += effectiveDuration
    if (i === config.scenes.length - 1) {
      sceneIndex = i
    }
  }

  state.setPlayback({
    currentTime: clampedTime,
    currentSceneIndex: sceneIndex,
  })
}

/**
 * Hook wrapper around seekToTime for components that need a stable reference.
 * Does NOT start a rAF loop — safe to call from any component.
 */
export function useSeekTo() {
  return { seekTo: seekToTime }
}

/**
 * usePlayback — requestAnimationFrame playback engine.
 *
 * IMPORTANT: Only mount this hook ONCE in the entire component tree
 * (inside AnimationPlayer). Multiple instances will create competing
 * rAF loops that double time advancement and break audio sync.
 */
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

    // Determine current scene (accounting for per-scene delays)
    let elapsed = 0
    let sceneIndex = 0
    for (let i = 0; i < config.scenes.length; i++) {
      const effectiveDuration = getEffectiveSceneDuration(config.scenes[i])
      if (newTime < elapsed + effectiveDuration) {
        sceneIndex = i
        break
      }
      elapsed += effectiveDuration
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
    seekToTime(time)
    lastTimeRef.current = 0
  }, [])

  return { seekTo }
}
