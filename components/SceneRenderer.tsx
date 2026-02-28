'use client'

import { getSceneComponent } from '@/lib/scene-registry'
import type { Scene } from '@/types'

interface SceneRendererProps {
  scene: Scene
  isActive: boolean
  progress: number
  onComplete: () => void
}

export function SceneRenderer({ scene, isActive, progress, onComplete }: SceneRendererProps) {
  const Component = getSceneComponent(scene.template)

  if (!Component) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
        <p className="text-text-muted text-sm">Unknown template: {scene.template}</p>
      </div>
    )
  }

  return (
    <Component
      isActive={isActive}
      progress={progress}
      onComplete={onComplete}
      data={scene.data}
    />
  )
}
