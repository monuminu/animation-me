'use client'

import { Sparkles, Download, Play, PanelRightOpen, PanelRightClose } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

export function TopBar() {
  const { projectTitle, animationConfig, isFileTreeOpen, toggleFileTree, openPreview } = useProjectStore()

  const hasAnimation = !!animationConfig

  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-bg-secondary/50 backdrop-blur-sm flex-shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">animation.me</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <span className="text-sm text-text-secondary truncate max-w-[200px]">
          {projectTitle}
        </span>
      </div>

      {/* Center: Progress / Status */}
      <div className="flex items-center gap-2">
        {animationConfig && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{animationConfig.scenes.length} scenes</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasAnimation}
          onClick={openPreview}
        >
          <Play className="w-3.5 h-3.5" />
          Preview
        </Button>
        <Button variant="secondary" size="sm">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFileTree}
                className={`!px-1.5 ${isFileTreeOpen ? 'text-accent' : 'text-text-muted'}`}
              >
                {isFileTreeOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isFileTreeOpen ? 'Hide files' : 'Show files'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
