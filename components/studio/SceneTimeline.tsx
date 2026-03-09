'use client'

import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useProjectStore } from '@/stores/project-store'
import { useSeekTo } from '@/hooks/usePlayback'
import { getEffectiveSceneDuration } from '@/lib/scene-utils'
import { SceneTimelineItem } from './SceneTimelineItem'

export function SceneTimeline() {
  const { animationConfig, playback, narration, reorderScenes } = useProjectStore()
  const { seekTo } = useSeekTo()
  const { currentTime, totalDuration, currentSceneIndex } = playback
  const { sceneAudios } = narration

  const scenes = animationConfig?.scenes ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = scenes.findIndex((s) => s.id === active.id)
      const newIndex = scenes.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderScenes(oldIndex, newIndex)
      }
    },
    [scenes, reorderScenes]
  )

  const handleSceneClick = useCallback(
    (sceneIndex: number) => {
      // Compute the start time for this scene
      let startTime = 0
      for (let i = 0; i < sceneIndex; i++) {
        startTime += getEffectiveSceneDuration(scenes[i])
      }
      seekTo(startTime)
    },
    [scenes, seekTo]
  )

  if (scenes.length === 0) return null

  // Compute playhead position as a percentage of total duration
  const playheadPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div className="relative flex-shrink-0 border-t border-border bg-bg-secondary/30">
      {/* Timeline container */}
      <div className="relative px-3 py-2 overflow-x-auto">
        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-accent z-20 pointer-events-none"
          style={{ left: `calc(12px + (100% - 24px) * ${playheadPercent / 100})` }}
        />
        {/* Playhead dot */}
        <div
          className="absolute top-0 w-2 h-2 bg-accent rounded-full z-20 pointer-events-none -translate-x-1/2"
          style={{ left: `calc(12px + (100% - 24px) * ${playheadPercent / 100})` }}
        />

        {/* DnD Context wrapping scene items */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scenes.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-1.5" style={{ minWidth: 'min-content' }}>
              {scenes.map((scene, index) => {
                const audio = sceneAudios.find((a) => a.sceneId === scene.id)
                return (
                  <div
                    key={scene.id}
                    onClick={() => handleSceneClick(index)}
                    className="cursor-pointer"
                  >
                    <SceneTimelineItem
                      scene={scene}
                      sceneIndex={index}
                      isActive={index === currentSceneIndex}
                      sceneAudio={audio}
                    />
                  </div>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
