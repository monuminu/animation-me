'use client'

import { useEffect, useRef } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { getEffectiveSceneDuration } from '@/lib/scene-utils'

/**
 * useAudioPlayback — Manages HTMLAudioElement pool synced to the animation clock.
 *
 * One Audio element per scene with ready audio. On scene change:
 * pause previous audio, play new scene audio from the start.
 * Respects isPlaying, muted, and speed (via playbackRate).
 */
export function useAudioPlayback() {
  const audioMapRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const prevSceneIndexRef = useRef<number>(-1)
  const prevIsPlayingRef = useRef<boolean>(false)
  const prevCurrentTimeRef = useRef<number>(0)

  const playback = useProjectStore((s) => s.playback)
  const narration = useProjectStore((s) => s.narration)
  const animationConfig = useProjectStore((s) => s.animationConfig)

  const { currentSceneIndex, isPlaying, speed, currentTime } = playback
  const { muted, sceneAudios } = narration

  // Create/update Audio elements when sceneAudios change
  useEffect(() => {
    const audioMap = audioMapRef.current

    // Add new audio elements for ready scenes
    for (const sceneAudio of sceneAudios) {
      if (sceneAudio.status === 'ready' && sceneAudio.audioUrl) {
        if (!audioMap.has(sceneAudio.sceneId)) {
          const audio = new Audio(sceneAudio.audioUrl)
          audio.preload = 'auto'
          audioMap.set(sceneAudio.sceneId, audio)
        }
      }
    }

    // Remove audio elements for scenes that no longer exist
    const validIds = new Set(sceneAudios.map((a) => a.sceneId))
    Array.from(audioMap.entries()).forEach(([id, audio]) => {
      if (!validIds.has(id)) {
        audio.pause()
        audio.src = ''
        audioMap.delete(id)
      }
    })
  }, [sceneAudios])

  // Sync muted state
  useEffect(() => {
    Array.from(audioMapRef.current.values()).forEach((audio) => {
      audio.muted = muted
    })
  }, [muted])

  // Sync playback rate
  useEffect(() => {
    Array.from(audioMapRef.current.values()).forEach((audio) => {
      audio.playbackRate = speed
    })
  }, [speed])

  // Handle play/pause and scene changes
  useEffect(() => {
    if (!animationConfig) return

    const scenes = animationConfig.scenes
    const currentScene = scenes[currentSceneIndex]
    if (!currentScene) return

    const audioMap = audioMapRef.current
    const sceneChanged = currentSceneIndex !== prevSceneIndexRef.current
    const playStateChanged = isPlaying !== prevIsPlayingRef.current

    // Detect loop (time jumped backwards significantly)
    const looped =
      currentTime < prevCurrentTimeRef.current &&
      prevCurrentTimeRef.current - currentTime > 1000

    // Calculate time within current scene
    let elapsed = 0
    for (let i = 0; i < currentSceneIndex; i++) {
      elapsed += getEffectiveSceneDuration(scenes[i])
    }

    if (!isPlaying) {
      // Pause all audio
      Array.from(audioMap.values()).forEach((audio) => {
        if (!audio.paused) audio.pause()
      })
    } else if (sceneChanged || looped || playStateChanged) {
      // Pause all audio first
      Array.from(audioMap.values()).forEach((audio) => {
        if (!audio.paused) audio.pause()
      })

      // Play current scene's audio from start
      const currentAudio = audioMap.get(currentScene.id)
      if (currentAudio) {
        currentAudio.currentTime = 0
        currentAudio.playbackRate = speed
        currentAudio.muted = muted
        currentAudio.play().catch(() => {
          // Browser autoplay policy may block - that's ok
        })
      }
    }

    prevSceneIndexRef.current = currentSceneIndex
    prevIsPlayingRef.current = isPlaying
    prevCurrentTimeRef.current = currentTime
  }, [currentSceneIndex, isPlaying, currentTime, speed, muted, animationConfig])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Array.from(audioMapRef.current.values()).forEach((audio) => {
        audio.pause()
        audio.src = ''
      })
      audioMapRef.current.clear()
    }
  }, [])
}
