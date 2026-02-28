'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Maximize,
  Minimize,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { usePlayback } from '@/hooks/usePlayback'
import { AnimationPlayer } from '@/components/AnimationPlayer'
import { formatTime, cn } from '@/lib/utils'
import { getPresetById } from '@/lib/canvas-presets'

export default function PreviewPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const {
    animationConfig,
    playback,
    togglePlayback,
    setPlayback,
    canvasPresetId,
    projectTitle,
  } = useProjectStore()

  const { seekTo } = usePlayback()
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showControls, setShowControls] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { isPlaying, currentTime, totalDuration, speed } = playback
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  const preset = getPresetById(canvasPresetId)
  const aspectRatio = `${preset.width} / ${preset.height}`

  // Auto-play on mount
  useEffect(() => {
    if (animationConfig) {
      setPlayback({
        currentTime: 0,
        currentSceneIndex: 0,
        isPlaying: true,
      })
    }
    return () => {
      // Pause when leaving
      setPlayback({ isPlaying: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-hide controls
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
    resetControlsTimer()
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [resetControlsTimer])

  // Show controls when paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [isPlaying])

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleGoBack = useCallback(() => {
    setPlayback({ isPlaying: false })
    router.push(`/studio/${projectId}`)
  }, [setPlayback, router, projectId])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen()
          } else {
            handleGoBack()
          }
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
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, totalDuration, isFullscreen, handleGoBack])

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  // No animation — show empty state with back button
  if (!animationConfig) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Play className="w-8 h-8 text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-white/70 mb-2">
              No animation to preview
            </p>
            <p className="text-sm text-white/40 max-w-[300px]">
              Go back to the studio and generate an animation first
            </p>
          </div>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-screen bg-black relative overflow-hidden"
      onMouseMove={resetControlsTimer}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* Animation canvas */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div
          className="relative overflow-hidden max-w-full max-h-full"
          style={{
            aspectRatio,
            width: preset.width >= preset.height ? '100%' : 'auto',
            height: preset.height >= preset.width ? '100%' : 'auto',
          }}
        >
          <AnimationPlayer />
        </div>
      </div>

      {/* Top bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4',
          'bg-gradient-to-b from-black/70 via-black/30 to-transparent',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white/90">
            {animationConfig.title || projectTitle}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{animationConfig.scenes.length} scenes</span>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors backdrop-blur-sm"
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
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
              onClick={() => {
                togglePlayback()
                resetControlsTimer()
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Time */}
            <div className="flex items-center gap-1.5 ml-2 text-xs text-white/60 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Right — speed + shortcuts */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSpeedChange}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors font-mono"
            >
              <Gauge className="w-3.5 h-3.5" />
              {speed}x
            </button>

            <div className="hidden md:flex items-center gap-2 text-[10px] text-white/30">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                Space
              </kbd>
              <span>play/pause</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                F
              </kbd>
              <span>fullscreen</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                Esc
              </kbd>
              <span>back</span>
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
