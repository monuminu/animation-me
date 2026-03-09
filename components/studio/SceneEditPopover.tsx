'use client'

import { useRef, useEffect } from 'react'
import { useProjectStore } from '@/stores/project-store'
import type { TransitionConfig } from '@/types'

// Human-readable labels for transition types
const TRANSITION_LABELS: Record<string, string> = {
  none: 'None',
  fade: 'Fade',
  fadeBlur: 'Fade + Blur',
  scaleFade: 'Scale + Fade',
  slideLeft: 'Slide Left',
  slideRight: 'Slide Right',
  slideUp: 'Slide Up',
  slideDown: 'Slide Down',
  wipe: 'Wipe',
  zoomThrough: 'Zoom Through',
  crossDissolve: 'Cross Dissolve',
  clipCircle: 'Clip Circle',
  perspectiveFlip: 'Perspective Flip',
  morphExpand: 'Morph Expand',
  splitHorizontal: 'Split Horizontal',
  splitVertical: 'Split Vertical',
  pushLeft: 'Push Left',
  pushRight: 'Push Right',
}

// Primary transition types (exclude backward-compat aliases)
const PRIMARY_TRANSITIONS = Object.keys(TRANSITION_LABELS)

interface SceneEditPopoverProps {
  sceneIndex: number
  onClose: () => void
  anchorRect: DOMRect | null
}

export function SceneEditPopover({ sceneIndex, onClose, anchorRect }: SceneEditPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const { animationConfig, updateSceneTransition, updateSceneDelay } = useProjectStore()

  const scene = animationConfig?.scenes[sceneIndex]
  if (!scene) return null

  const transition = scene.transition ?? { type: 'fade' as const, duration: 300 }
  const transitionDuration = transition.duration ?? 300
  const delay = scene.delay ?? 0

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleTransitionTypeChange = (type: string) => {
    updateSceneTransition(sceneIndex, { type: type as TransitionConfig['type'] })
  }

  const handleTransitionDurationChange = (delta: number) => {
    const newDuration = Math.max(100, Math.min(800, transitionDuration + delta))
    updateSceneTransition(sceneIndex, { duration: newDuration })
  }

  const handleDelayChange = (delta: number) => {
    const newDelay = Math.max(0, Math.min(5000, delay + delta))
    updateSceneDelay(sceneIndex, newDelay)
  }

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 w-64 rounded-lg border border-border bg-bg-secondary shadow-xl shadow-black/30 p-3 animate-fade-in"
      style={{
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-bg-secondary border-r border-b border-border"
      />

      {/* Transition Type */}
      <div className="mb-3">
        <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">
          Transition
        </label>
        <select
          value={transition.type}
          onChange={(e) => handleTransitionTypeChange(e.target.value)}
          className="w-full h-7 px-2 rounded-md bg-bg-elevated border border-border text-xs text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-accent/50 transition-colors"
        >
          {PRIMARY_TRANSITIONS.map((type) => (
            <option key={type} value={type}>
              {TRANSITION_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Transition Duration */}
      <div className="mb-3">
        <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">
          Transition Duration
        </label>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleTransitionDurationChange(-50)}
            disabled={transitionDuration <= 100}
            className="w-7 h-7 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span className="flex-1 text-center text-xs font-mono text-text-primary">
            {transitionDuration}ms
          </span>
          <button
            onClick={() => handleTransitionDurationChange(50)}
            disabled={transitionDuration >= 800}
            className="w-7 h-7 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Post-Audio Hold */}
      <div>
        <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">
          Post-Audio Hold
        </label>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDelayChange(-100)}
            disabled={delay <= 0}
            className="w-7 h-7 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span className="flex-1 text-center text-xs font-mono text-text-primary">
            {delay >= 1000 ? `${(delay / 1000).toFixed(1)}s` : `${delay}ms`}
          </span>
          <button
            onClick={() => handleDelayChange(100)}
            disabled={delay >= 5000}
            className="w-7 h-7 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
