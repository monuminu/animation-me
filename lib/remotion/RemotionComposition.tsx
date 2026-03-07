import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneRenderer } from '@/components/SceneRenderer'
import { getTransition, clamp } from '@/lib/video'
import { getEffectiveSceneDuration } from '@/lib/scene-utils'
import type { AnimationConfig } from '@/types'

export type RemotionCompositionProps = {
  animationConfig: AnimationConfig
  // These are passed as inputProps for calculateMetadata but not used directly by the component
  fps: number
  width: number
  height: number
  [key: string]: unknown
}

/**
 * RemotionComposition — Bridge between Remotion's frame-based system and
 * our progress-based scene templates.
 *
 * Mirrors the rendering logic of AnimationPlayer.tsx but derives currentTime
 * from Remotion's useCurrentFrame() instead of Zustand playback state.
 */
export const RemotionComposition: React.FC<RemotionCompositionProps> = ({
  animationConfig,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const { scenes } = animationConfig

  // Convert frame to time in milliseconds
  const currentTime = (frame / fps) * 1000

  // Determine current scene index and elapsed time before it (accounting for delays)
  let elapsed = 0
  let currentSceneIndex = 0
  for (let i = 0; i < scenes.length; i++) {
    const effectiveDuration = getEffectiveSceneDuration(scenes[i])
    if (currentTime < elapsed + effectiveDuration) {
      currentSceneIndex = i
      break
    }
    elapsed += effectiveDuration
    if (i === scenes.length - 1) {
      currentSceneIndex = i
    }
  }

  // Calculate progress within current scene
  const sceneTime = currentTime - elapsed
  const currentScene = scenes[currentSceneIndex]
  const contentDuration = currentScene?.duration ?? 0
  const sceneDelay = currentScene?.delay ?? 0

  // During delay phase, freeze progress at 1 (last frame stays visible)
  const isInDelay = sceneTime >= contentDuration
  const progress = currentScene
    ? isInDelay
      ? 1
      : Math.min(sceneTime / contentDuration, 1)
    : 0

  // Determine transition state (mirrors AnimationPlayer.tsx)
  const nextSceneIndex =
    currentSceneIndex + 1 < scenes.length ? currentSceneIndex + 1 : null
  const transitionConfig = currentScene?.transition
  const transition = getTransition(transitionConfig?.type)
  const transitionDuration = transitionConfig?.duration ?? transition.defaultDuration

  // Transition window overlaps the end of the delay period
  const totalSceneWindow = contentDuration + sceneDelay
  const transitionWindowStart = currentScene
    ? totalSceneWindow - transitionDuration
    : 0
  const isInTransition =
    transitionDuration > 0 &&
    nextSceneIndex !== null &&
    sceneTime >= transitionWindowStart &&
    transitionConfig?.type !== 'none'
  const transitionProgress = isInTransition
    ? clamp((sceneTime - transitionWindowStart) / transitionDuration, 0, 1)
    : 0

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0d1117',
      }}
    >
      {scenes.map((scene, index) => {
        const isCurrentScene = index === currentSceneIndex
        const isNextScene = index === nextSceneIndex

        const isVisible = isCurrentScene || (isInTransition && isNextScene)
        if (!isVisible) {
          return (
            <div
              key={scene.id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                pointerEvents: 'none',
              }}
            >
              <SceneRenderer
                scene={scene}
                isActive={false}
                progress={0}
                onComplete={() => {}}
              />
            </div>
          )
        }

        // Calculate transition styles for active scenes
        let transitionStyles: React.CSSProperties = {}

        if (isInTransition && isCurrentScene) {
          transitionStyles = transition.exit(transitionProgress)
        } else if (isInTransition && isNextScene) {
          transitionStyles = transition.enter(transitionProgress)
        }

        return (
          <div
            key={scene.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isCurrentScene && !isInTransition ? 1 : undefined,
              pointerEvents: isCurrentScene ? 'auto' : 'none',
              zIndex: isNextScene ? 1 : 0,
              ...transitionStyles,
            }}
          >
            <SceneRenderer
              scene={scene}
              isActive={isCurrentScene}
              progress={isCurrentScene ? progress : 0}
              onComplete={() => {}}
            />
          </div>
        )
      })}
    </div>
  )
}
