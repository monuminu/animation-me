'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Volume2, Clock } from 'lucide-react'
import { getEffectiveSceneDuration, getResolvedDuration } from '@/lib/scene-utils'
import { SceneEditPopover } from './SceneEditPopover'
import { cn } from '@/lib/utils'
import type { Scene, SceneAudio } from '@/types'

// Human-readable labels for transition types (short form)
const TRANSITION_SHORT_LABELS: Record<string, string> = {
  none: 'none',
  fade: 'fade',
  fadeBlur: 'fadeBlur',
  scaleFade: 'scaleFade',
  slideLeft: 'slideLeft',
  slideRight: 'slideRight',
  slideUp: 'slideUp',
  slideDown: 'slideDown',
  wipe: 'wipe',
  zoomThrough: 'zoom',
  crossDissolve: 'dissolve',
  clipCircle: 'circle',
  perspectiveFlip: 'flip',
  morphExpand: 'morph',
  splitHorizontal: 'splitH',
  splitVertical: 'splitV',
  pushLeft: 'pushL',
  pushRight: 'pushR',
  slide: 'slide',
  morph: 'morph',
}

interface SceneTimelineItemProps {
  scene: Scene
  sceneIndex: number
  isActive: boolean
  sceneAudio?: SceneAudio
}

export function SceneTimelineItem({ scene, sceneIndex, isActive, sceneAudio }: SceneTimelineItemProps) {
  const [showPopover, setShowPopover] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition: sortableTransition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: sortableTransition,
    flex: `${getEffectiveSceneDuration(scene)} 0 0`,
    minWidth: '100px',
  }

  const transitionConfig = scene.transition ?? { type: 'fade' as const, duration: 300 }
  const transitionLabel = TRANSITION_SHORT_LABELS[transitionConfig.type] ?? transitionConfig.type
  const transitionDuration = transitionConfig.duration ?? 300
  const delay = scene.delay ?? 0

  // scene.duration = audioDurationMs + paddingMs (set by TTS pass)
  // sceneAudio.audioDuration = raw audio length (no padding)
  // getResolvedDuration(scene) = scene.duration ?? 5000 (content phase length)
  // getEffectiveSceneDuration(scene) = content duration + delay (total time on timeline)
  const contentDuration = getResolvedDuration(scene) // what drives playback
  const effectiveDuration = getEffectiveSceneDuration(scene) // total timeline time
  const rawAudioDuration = sceneAudio?.audioDuration ?? 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex flex-col gap-0.5 px-2 py-1.5 rounded-md border transition-all select-none',
        isDragging
          ? 'opacity-50 shadow-lg shadow-black/30 z-10'
          : isActive
            ? 'border-l-2 border-l-accent border-t border-r border-b border-border bg-accent/5'
            : 'border-border bg-bg-elevated hover:bg-bg-hover'
      )}
    >
      {/* Row 1: Drag handle + scene name + effective duration */}
      <div className="flex items-center gap-1 min-w-0">
        <button
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded text-text-muted hover:text-text-secondary transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <span className="text-[11px] font-medium text-text-primary truncate">
          {sceneIndex + 1}. {scene.template}
        </span>
        <span className="ml-auto text-[10px] font-mono text-text-secondary flex-shrink-0">
          {(effectiveDuration / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Row 2: Audio duration (raw) + content duration */}
      <div className="flex items-center gap-2 pl-5">
        {rawAudioDuration > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-text-muted font-mono" title="Audio length">
            <Volume2 className="w-2.5 h-2.5 flex-shrink-0" />
            {(rawAudioDuration / 1000).toFixed(1)}s
          </span>
        )}
        <span className="flex items-center gap-0.5 text-[10px] text-text-muted font-mono" title="Scene duration (audio + padding)">
          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
          {(contentDuration / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Row 3: Transition + hold — clickable to open popover */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowPopover(!showPopover)
        }}
        className="flex items-center gap-2 pl-5 text-[10px] text-text-muted hover:text-accent transition-colors cursor-pointer text-left"
      >
        <span className="font-mono">
          {transitionLabel} {transitionDuration}ms
        </span>
        <span className="text-text-muted/60">|</span>
        <span className="font-mono">
          hold: {delay >= 1000 ? `${(delay / 1000).toFixed(1)}s` : `${delay}ms`}
        </span>
      </button>

      {/* Edit Popover */}
      {showPopover && (
        <SceneEditPopover
          sceneIndex={sceneIndex}
          onClose={() => setShowPopover(false)}
          anchorRect={null}
        />
      )}
    </div>
  )
}
