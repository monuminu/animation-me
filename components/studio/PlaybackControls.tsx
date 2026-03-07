'use client'

import { Play, Pause, SkipBack, SkipForward, Gauge, Timer } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { formatTime } from '@/lib/utils'
import { usePlayback } from '@/hooks/usePlayback'

export function PlaybackControls() {
  const { playback, animationConfig, togglePlayback, setPlayback, updateSceneDelay } = useProjectStore()
  const { seekTo } = usePlayback()
  const { isPlaying, currentTime, totalDuration, speed, currentSceneIndex } = playback

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0
  const hasAnimation = !!animationConfig

  const currentScene = animationConfig?.scenes[currentSceneIndex]
  const currentDelay = currentScene?.delay ?? 0

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    seekTo(value / 100 * totalDuration)
  }

  const handleRestart = () => {
    seekTo(0)
  }

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2]
    const currentIndex = speeds.indexOf(speed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlayback({ speed: nextSpeed })
  }

  const handleDelayDecrease = () => {
    if (!hasAnimation) return
    updateSceneDelay(currentSceneIndex, Math.max(0, currentDelay - 100))
  }

  const handleDelayIncrease = () => {
    if (!hasAnimation) return
    updateSceneDelay(currentSceneIndex, currentDelay + 100)
  }

  return (
    <div className="h-14 flex items-center gap-3 px-4 border-t border-border bg-bg-secondary/50 flex-shrink-0">
      {/* Transport Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleRestart}
          disabled={!hasAnimation}
          className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={togglePlayback}
          disabled={!hasAnimation}
          className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <button
          disabled={!hasAnimation}
          className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Time */}
      <span className="text-xs text-text-muted font-mono min-w-[40px]">
        {formatTime(currentTime)}
      </span>

      {/* Scrubber */}
      <div className="flex-1 relative group">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleScrubberChange}
          disabled={!hasAnimation}
          className="w-full h-1 bg-bg-elevated rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-30
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-accent/30 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
          style={{
            background: hasAnimation
              ? `linear-gradient(to right, #7c3aed ${progress}%, #1e1e22 ${progress}%)`
              : undefined,
          }}
        />
      </div>

      {/* Duration */}
      <span className="text-xs text-text-muted font-mono min-w-[40px] text-right">
        {formatTime(totalDuration)}
      </span>

      {/* Scene Delay */}
      <div
        className="flex items-center gap-0.5"
        title={`Scene ${currentSceneIndex + 1} delay`}
      >
        <Timer className="w-3 h-3 text-text-muted mr-0.5" />
        <button
          onClick={handleDelayDecrease}
          disabled={!hasAnimation || currentDelay <= 0}
          className="w-5 h-5 rounded flex items-center justify-center text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="text-xs text-text-muted font-mono min-w-[36px] text-center">
          {currentDelay > 0 ? `${currentDelay}ms` : '0ms'}
        </span>
        <button
          onClick={handleDelayIncrease}
          disabled={!hasAnimation}
          className="w-5 h-5 rounded flex items-center justify-center text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>

      {/* Speed */}
      <button
        onClick={handleSpeedChange}
        disabled={!hasAnimation}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-bg-hover text-text-muted text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Gauge className="w-3 h-3" />
        {speed}x
      </button>
    </div>
  )
}
