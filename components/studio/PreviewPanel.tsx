'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { PlaybackControls } from './PlaybackControls'
import { AnimationPlayer } from '@/components/AnimationPlayer'
import { Clapperboard, ChevronDown, Check, Monitor, Smartphone } from 'lucide-react'
import { CANVAS_PRESETS, PRESET_CATEGORIES, getPresetById } from '@/lib/canvas-presets'
import { cn } from '@/lib/utils'

export function PreviewPanel() {
  const { animationConfig, canvasPresetId, setCanvasPresetId } = useProjectStore()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const preset = getPresetById(canvasPresetId)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Compute aspect ratio style
  const aspectRatio = `${preset.width} / ${preset.height}`
  const isPortrait = preset.height > preset.width
  const isSquare = preset.width === preset.height

  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Preview toolbar */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {preset.width} × {preset.height}
          </span>
        </div>

        {/* Canvas size dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors',
              'hover:bg-bg-hover border border-transparent',
              isDropdownOpen ? 'bg-bg-hover border-border text-text-primary' : 'text-text-secondary'
            )}
          >
            {preset.category === 'standard' ? (
              <Monitor className="w-3 h-3" />
            ) : (
              <Smartphone className="w-3 h-3" />
            )}
            <span>{preset.label}</span>
            <ChevronDown className={cn('w-3 h-3 transition-transform', isDropdownOpen && 'rotate-180')} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-bg-secondary shadow-xl shadow-black/30 z-50 py-1 overflow-hidden animate-fade-in">
              <div className="max-h-[400px] overflow-y-auto">
                {PRESET_CATEGORIES.map((category, catIndex) => {
                  const presets = CANVAS_PRESETS.filter((p) => p.category === category.id)
                  return (
                    <div key={category.id}>
                      {catIndex > 0 && (
                        <div className="h-px bg-border mx-2 my-1" />
                      )}
                      <div className="px-3 py-1.5">
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                          {category.label}
                        </span>
                      </div>
                      {presets.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setCanvasPresetId(p.id)
                            setIsDropdownOpen(false)
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors',
                            p.id === canvasPresetId
                              ? 'bg-accent/10 text-accent'
                              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                          )}
                        >
                          <span>{p.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-muted">
                              {p.width}×{p.height}
                            </span>
                            {p.id === canvasPresetId && (
                              <Check className="w-3 h-3 text-accent" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div
          className={cn(
            'relative rounded-lg overflow-hidden bg-[#0d1117] border border-border/50 shadow-2xl',
            isPortrait ? 'h-full' : isSquare ? 'h-full' : 'w-full'
          )}
          style={{
            aspectRatio,
            ...(isPortrait
              ? { maxHeight: '100%', maxWidth: '100%' }
              : isSquare
                ? { maxHeight: '100%', maxWidth: '100%' }
                : { maxWidth: '900px', maxHeight: '100%' }
            ),
          }}
        >
          {animationConfig ? (
            <AnimationPlayer />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-bg-elevated/80 border border-border flex items-center justify-center mb-4">
                <Clapperboard className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                Your animation will appear here
              </p>
              <p className="text-xs text-text-muted max-w-[260px]">
                Type a prompt in the chat panel to generate your first animation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackControls />
    </div>
  )
}
