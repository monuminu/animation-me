'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Play, Pause, SkipBack, SkipForward, Gauge, Timer } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useSeekTo } from '@/hooks/usePlayback'
import { AnimationPlayer } from '@/components/AnimationPlayer'
import { formatTime, cn } from '@/lib/utils'
import { getPresetById } from '@/lib/canvas-presets'

export function PreviewModal() {
  const {
    isPreviewOpen,
    closePreview,
    animationConfig,
    playback,
    togglePlayback,
    setPlayback,
    canvasPresetId,
    updateSceneDelay,
  } = useProjectStore()

  const { seekTo } = useSeekTo()
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showControls, setShowControls] = useState(true)

  const { isPlaying, currentTime, totalDuration, speed, currentSceneIndex } = playback
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  const currentScene = animationConfig?.scenes[currentSceneIndex]
  const currentDelay = currentScene?.delay ?? 0

  const preset = getPresetById(canvasPresetId)
  const aspectRatio = `${preset.width} / ${preset.height}`

  // Auto-hide controls after 3 seconds of no mouse movement
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => {
      if (useProjectStore.getState().playback.isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [])

  useEffect(() => {
    if (!isPreviewOpen) return
    resetControlsTimer()
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [isPreviewOpen, resetControlsTimer])

  // Show controls when paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [isPlaying])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isPreviewOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          closePreview()
          break
        case ' ':
          e.preventDefault()
          togglePlayback()
          resetControlsTimer()
          break
        case 'ArrowLeft':
          e.preventDefault()
          seekTo(Math.max(0, currentTime - 1000))
          resetControlsTimer()
          break
        case 'ArrowRight':
          e.preventDefault()
          seekTo(Math.min(totalDuration, currentTime + 1000))
          resetControlsTimer()
          break
        case 'Home':
        case '0':
          e.preventDefault()
          seekTo(0)
          resetControlsTimer()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPreviewOpen, closePreview, togglePlayback, seekTo, currentTime, totalDuration, resetControlsTimer])

  if (!isPreviewOpen || !animationConfig) return null

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    seekTo((value / 100) * totalDuration)
  }

  const handleRestart = () => {
    seekTo(0)
    resetControlsTimer()
  }

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2]
    const currentIndex = speeds.indexOf(speed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlayback({ speed: nextSpeed })
    resetControlsTimer()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onMouseMove={resetControlsTimer}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* Animation canvas — centered, aspect-ratio based */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div
          className="relative overflow-hidden w-full h-full"
          style={{
            aspectRatio,
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
          }}
        >
          <AnimationPlayer />
        </div>
      </div>

      {/* Top bar — close button & info */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4',
          'bg-gradient-to-b from-black/70 via-black/30 to-transparent',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/90">
            {animationConfig.title}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{animationConfig.scenes.length} scenes</span>
          </div>
        </div>

        <button
          onClick={closePreview}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors backdrop-blur-sm"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 pt-12',
          'bg-gradient-to-t from-black/80 via-black/40 to-transparent',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Scrubber */}
        <div className="mb-4 px-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleScrubberChange}
            className="w-full h-1 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
            style={{
              background: `linear-gradient(to right, #7c3aed ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Left — transport */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => { togglePlayback(); resetControlsTimer() }}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Time */}
            <div className="flex items-center gap-1.5 ml-2 text-xs text-white/60 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Right — delay + speed + shortcuts hint */}
          <div className="flex items-center gap-3">
            {/* Scene Delay */}
            <div
              className="flex items-center gap-0.5"
              title={`Scene ${currentSceneIndex + 1} delay`}
            >
              <Timer className="w-3.5 h-3.5 text-white/50 mr-0.5" />
              <button
                onClick={() => {
                  updateSceneDelay(currentSceneIndex, Math.max(0, currentDelay - 100))
                  resetControlsTimer()
                }}
                disabled={currentDelay <= 0}
                className="w-6 h-6 rounded flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                −
              </button>
              <span className="text-xs text-white/60 font-mono min-w-[36px] text-center">
                {currentDelay > 0 ? `${currentDelay}ms` : '0ms'}
              </span>
              <button
                onClick={() => {
                  updateSceneDelay(currentSceneIndex, currentDelay + 100)
                  resetControlsTimer()
                }}
                className="w-6 h-6 rounded flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleSpeedChange}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors font-mono"
            >
              <Gauge className="w-3.5 h-3.5" />
              {speed}x
            </button>

            <div className="hidden md:flex items-center gap-2 text-[10px] text-white/30">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Space</kbd>
              <span>play/pause</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Esc</kbd>
              <span>close</span>
            </div>
          </div>
        </div>
      </div>

      {/* Click center area to toggle play/pause */}
      <div
        className="absolute inset-0 z-[5]"
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target === e.currentTarget) {
            togglePlayback()
            resetControlsTimer()
          }
        }}
      />
    </div>
  )
}
