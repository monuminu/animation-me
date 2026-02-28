'use client'

import { useProjectStore } from '@/stores/project-store'
import { usePlayback } from '@/hooks/usePlayback'
import { SceneRenderer } from './SceneRenderer'

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

  return (
    <div className="w-full h-full relative overflow-hidden">
      {scenes.map((scene, index) => (
        <div
          key={scene.id}
          className="absolute inset-0"
          style={{
            opacity: index === currentSceneIndex ? 1 : 0,
            pointerEvents: index === currentSceneIndex ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <SceneRenderer
            scene={scene}
            isActive={index === currentSceneIndex}
            progress={index === currentSceneIndex ? progress : 0}
            onComplete={() => {}}
          />
        </div>
      ))}
    </div>
  )
}
