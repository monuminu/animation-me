'use client'

import { useProjectStore } from '@/stores/project-store'
import { usePlayback } from '@/hooks/usePlayback'
import { SceneRenderer } from './SceneRenderer'
import { getTransition } from '@/lib/video'
import { clamp } from '@/lib/video'

export function AnimationPlayer() {
  const { animationConfig, playback } = useProjectStore()
  usePlayback()

  if (!animationConfig) return null

  const { scenes } = animationConfig
  const { currentSceneIndex, currentTime } = playback

  // Calculate progress within current scene
  let elapsed = 0
  for (let i = 0; i < currentSceneIndex; i++) {
    elapsed += scenes[i].duration
  }
  const sceneTime = currentTime - elapsed
  const currentScene = scenes[currentSceneIndex]
  const progress = currentScene ? Math.min(sceneTime / currentScene.duration, 1) : 0

  // Determine transition state
  const nextSceneIndex = currentSceneIndex + 1 < scenes.length ? currentSceneIndex + 1 : null
  const transitionConfig = currentScene?.transition
  const transition = getTransition(transitionConfig?.type)
  const transitionDuration = transitionConfig?.duration ?? transition.defaultDuration

  // Calculate transition progress: how far into the transition window we are
  // Transition window = last `transitionDuration` ms of the current scene
  const transitionWindowStart = currentScene
    ? currentScene.duration - transitionDuration
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
    <div className="w-full h-full relative overflow-hidden">
      {scenes.map((scene, index) => {
        const isCurrentScene = index === currentSceneIndex
        const isNextScene = index === nextSceneIndex

        // Determine if this scene should be visible
        const isVisible = isCurrentScene || (isInTransition && isNextScene)
        if (!isVisible) {
          return (
            <div
              key={scene.id}
              className="absolute inset-0"
              style={{
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
          // Exiting scene
          transitionStyles = transition.exit(transitionProgress)
        } else if (isInTransition && isNextScene) {
          // Entering scene
          transitionStyles = transition.enter(transitionProgress)
        }

        return (
          <div
            key={scene.id}
            className="absolute inset-0"
            style={{
              opacity: isCurrentScene && !isInTransition ? 1 : undefined,
              pointerEvents: isCurrentScene ? 'auto' : 'none',
              // Layer entering scene above exiting scene
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
