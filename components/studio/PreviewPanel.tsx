'use client'

import { useProjectStore } from '@/stores/project-store'
import { PlaybackControls } from './PlaybackControls'
import { AnimationPlayer } from '@/components/AnimationPlayer'
import { Clapperboard } from 'lucide-react'

export function PreviewPanel() {
  const { animationConfig } = useProjectStore()

  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="relative w-full max-w-[900px] aspect-video rounded-lg overflow-hidden bg-[#0d1117] border border-border/50 shadow-2xl">
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
