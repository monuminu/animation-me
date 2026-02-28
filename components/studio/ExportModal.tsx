'use client'

import { useState, useEffect } from 'react'
import {
  X, Download, Film, Monitor, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useExportMP4 } from '@/hooks/useExportMP4'
import { getPresetById } from '@/lib/canvas-presets'
import { estimateFileSize, formatFileSize, getQualityBitrate } from '@/lib/export-utils'
import { formatTime, cn } from '@/lib/utils'
import type { ExportConfig } from '@/types'

const QUALITY_OPTIONS = [
  { value: 'low' as const, label: 'Low', bitrate: '2 Mbps' },
  { value: 'medium' as const, label: 'Medium', bitrate: '5 Mbps' },
  { value: 'high' as const, label: 'High', bitrate: '10 Mbps' },
]

const FPS_OPTIONS = [
  { value: 24 as const, label: '24 fps', desc: 'Cinematic' },
  { value: 30 as const, label: '30 fps', desc: 'Standard' },
  { value: 60 as const, label: '60 fps', desc: 'Smooth' },
]

export function ExportModal() {
  const {
    isExportModalOpen,
    closeExportModal,
    animationConfig,
    canvasPresetId,
    exportProgress,
    isExporting,
  } = useProjectStore()

  const { exportMP4, cancelExport } = useExportMP4()

  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [fps, setFps] = useState<24 | 30 | 60>(30)

  const preset = getPresetById(canvasPresetId)

  // Reset state when modal opens
  useEffect(() => {
    if (isExportModalOpen) {
      setQuality('medium')
      setFps(30)
    }
  }, [isExportModalOpen])

  // Escape to close when not exporting
  useEffect(() => {
    if (!isExportModalOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isExporting) {
        closeExportModal()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExportModalOpen, isExporting, closeExportModal])

  if (!isExportModalOpen || !animationConfig) return null

  const bitrate = getQualityBitrate(quality)
  const estSize = estimateFileSize(bitrate, animationConfig.totalDuration)
  const totalFrames = Math.ceil((animationConfig.totalDuration / 1000) * fps)

  const handleExport = () => {
    const config: ExportConfig = {
      width: preset.width,
      height: preset.height,
      fps,
      quality,
      format: 'mp4',
    }
    exportMP4(config)
  }

  const handleClose = () => {
    if (isExporting) {
      cancelExport()
    }
    closeExportModal()
  }

  const phase = exportProgress?.phase
  const isDone = phase === 'done'
  const isError = phase === 'error'
  const isWorking = isExporting || phase === 'preparing' || phase === 'rendering' || phase === 'encoding' || phase === 'finalizing'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={!isWorking ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[480px] rounded-2xl bg-bg-secondary border border-border shadow-2xl shadow-black/40 overflow-hidden animate-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <Film className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Export Animation</h2>
                <p className="text-xs text-text-muted">{animationConfig.title}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Resolution */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Resolution</label>
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border">
                <Monitor className="w-4 h-4 text-text-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary font-medium">
                    {preset.width} × {preset.height}
                  </div>
                  <div className="text-xs text-text-muted">{preset.label}</div>
                </div>
                <span className="text-[10px] text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">
                  from canvas
                </span>
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => !isWorking && setQuality(opt.value)}
                    disabled={isWorking}
                    className={cn(
                      'relative flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-center transition-all duration-200',
                      quality === opt.value
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'bg-bg-elevated border-border text-text-secondary hover:border-border-hover hover:text-text-primary',
                      isWorking && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-[10px] text-text-muted">{opt.bitrate}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FPS */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Frame Rate</label>
              <div className="grid grid-cols-3 gap-2">
                {FPS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => !isWorking && setFps(opt.value)}
                    disabled={isWorking}
                    className={cn(
                      'flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-center transition-all duration-200',
                      fps === opt.value
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'bg-bg-elevated border-border text-text-secondary hover:border-border-hover hover:text-text-primary',
                      isWorking && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-[10px] text-text-muted">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info row */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-text-muted">Duration: </span>
                  <span className="text-text-primary font-medium">{formatTime(animationConfig.totalDuration)}</span>
                </div>
                <div>
                  <span className="text-text-muted">Frames: </span>
                  <span className="text-text-primary font-medium">{totalFrames.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="text-text-muted">~</span>
                <span className="text-text-primary font-medium">{formatFileSize(estSize)}</span>
              </div>
            </div>

            {/* Progress bar */}
            {exportProgress && isWorking && (
              <div className="space-y-2.5">
                <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-purple-400 transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-accent" />
                    <span className="text-text-secondary">
                      {exportProgress.phase === 'preparing' && 'Preparing render...'}
                      {exportProgress.phase === 'rendering' &&
                        `Rendering frames... (${exportProgress.currentFrame}/${exportProgress.totalFrames})`}
                      {exportProgress.phase === 'encoding' && 'Encoding MP4...'}
                      {exportProgress.phase === 'finalizing' && 'Finalizing...'}
                    </span>
                  </div>
                  <span className="text-text-muted font-mono">{exportProgress.percent}%</span>
                </div>
              </div>
            )}

            {/* Done */}
            {isDone && (
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Export complete!</p>
                  <p className="text-xs text-emerald-400/70">Your MP4 has been downloaded.</p>
                </div>
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-red-300 font-medium">Export failed</p>
                  <p className="text-xs text-red-400/70 truncate">{exportProgress?.error || 'Unknown error'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              {isDone ? 'Close' : 'Cancel'}
            </button>

            {!isDone && !isError && (
              <button
                onClick={handleExport}
                disabled={isWorking}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isWorking
                    ? 'bg-accent/20 text-accent/50 cursor-not-allowed'
                    : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 hover:shadow-accent/30'
                )}
              >
                {isWorking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isWorking ? 'Exporting...' : 'Export MP4'}
              </button>
            )}

            {(isDone || isError) && (
              <button
                onClick={() => useProjectStore.getState().setExportProgress(null)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export again
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
