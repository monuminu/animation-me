'use client'

import { useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { computeTotalDuration } from '@/lib/scene-utils'
import type { AnimationConfig, SceneAudio } from '@/types'

/**
 * Measure the duration of an audio blob URL in milliseconds.
 */
function measureAudioDuration(blobUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'metadata'

    audio.onloadedmetadata = () => {
      const durationMs = audio.duration * 1000
      resolve(durationMs)
    }

    audio.onerror = () => {
      reject(new Error('Failed to load audio metadata'))
    }

    audio.src = blobUrl
  })
}

/**
 * useNarration — Orchestrates TTS generation for all scenes with narration text.
 *
 * Generates audio sequentially (one scene at a time) to avoid ElevenLabs 409
 * "already_running" conflicts. Measures durations and extends scene delays
 * when audio is longer than the scene's visual duration + existing delay.
 */
export function useNarration() {
  const abortControllerRef = useRef<AbortController | null>(null)

  const generateNarration = useCallback(
    async (config: AnimationConfig): Promise<AnimationConfig> => {
      const store = useProjectStore.getState()

      // Find scenes that have narration text
      const scenesWithNarration = config.scenes.filter(
        (s) => s.narration && s.narration.trim().length > 0
      )

      if (scenesWithNarration.length === 0) {
        return config
      }

      // Cancel any in-progress generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      store.setNarrationGenerating(true)
      store.setNarrationProgress(0)

      // Initialize pending state for each scene
      for (const scene of scenesWithNarration) {
        store.setSceneAudio(scene.id, { status: 'pending' })
      }

      let completedCount = 0
      const sceneAudioResults: Map<string, { blobUrl: string; durationMs: number }> =
        new Map()

      // Generate TTS sequentially to avoid ElevenLabs 409 "already_running" conflicts.
      // The API rejects concurrent requests for the same voice, so we serialize them.
      for (const scene of scenesWithNarration) {
        if (abortController.signal.aborted) break

        store.setSceneAudio(scene.id, { status: 'generating' })

        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: scene.narration,
              voiceId: store.narration.voiceId || undefined,
            }),
            signal: abortController.signal,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `TTS failed with status ${response.status}`)
          }

          const audioBlob = await response.blob()
          const blobUrl = URL.createObjectURL(audioBlob)

          // Measure actual audio duration
          const durationMs = await measureAudioDuration(blobUrl)

          sceneAudioResults.set(scene.id, { blobUrl, durationMs })

          store.setSceneAudio(scene.id, {
            audioUrl: blobUrl,
            audioDuration: durationMs,
            status: 'ready',
          })
        } catch (error) {
          if ((error as Error).name === 'AbortError') break

          console.error(`TTS error for scene ${scene.id}:`, error)
          store.setSceneAudio(scene.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'TTS generation failed',
          })
        } finally {
          completedCount++
          const progress = Math.round(
            (completedCount / scenesWithNarration.length) * 100
          )
          store.setNarrationProgress(progress)
        }
      }

      if (abortController.signal.aborted) {
        store.setNarrationGenerating(false)
        return config
      }

      // Adjust scene delays where audio exceeds visual duration
      const PADDING_MS = 500 // breathing room after audio
      const adjustedScenes = config.scenes.map((scene) => {
        const audioResult = sceneAudioResults.get(scene.id)
        if (!audioResult) return scene

        const visualWindow = scene.duration + (scene.delay ?? 0)
        const neededDuration = audioResult.durationMs + PADDING_MS

        if (neededDuration > visualWindow) {
          // Extend the delay (not the animation duration) to accommodate audio
          const extraTime = neededDuration - visualWindow
          return {
            ...scene,
            delay: (scene.delay ?? 0) + extraTime,
          }
        }

        return scene
      })

      const adjustedConfig: AnimationConfig = {
        ...config,
        scenes: adjustedScenes,
        totalDuration: computeTotalDuration(adjustedScenes),
      }

      store.setNarrationGenerating(false)
      abortControllerRef.current = null

      return adjustedConfig
    },
    []
  )

  const cancelNarration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    const store = useProjectStore.getState()
    store.setNarrationGenerating(false)
  }, [])

  return { generateNarration, cancelNarration }
}
