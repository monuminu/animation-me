import type { Scene } from '@/types'

/**
 * Given an array of scenes and a time in milliseconds,
 * returns the current scene index, the elapsed time before the scene,
 * and the progress (0–1) within that scene.
 */
export function getSceneAtTime(
  scenes: Scene[],
  timeMs: number
): { sceneIndex: number; progress: number; elapsed: number } {
  let elapsed = 0

  for (let i = 0; i < scenes.length; i++) {
    const sceneDuration = scenes[i].duration
    if (timeMs < elapsed + sceneDuration) {
      const sceneTime = timeMs - elapsed
      return {
        sceneIndex: i,
        progress: Math.min(sceneTime / sceneDuration, 1),
        elapsed,
      }
    }
    elapsed += sceneDuration
  }

  // Past the end — return last scene at progress 1
  return {
    sceneIndex: Math.max(0, scenes.length - 1),
    progress: 1,
    elapsed,
  }
}

/**
 * Map quality setting to approximate bitrate in bits per second.
 */
export function getQualityBitrate(quality: 'low' | 'medium' | 'high'): number {
  switch (quality) {
    case 'low':
      return 2_000_000 // 2 Mbps
    case 'medium':
      return 5_000_000 // 5 Mbps
    case 'high':
      return 10_000_000 // 10 Mbps
    default:
      return 5_000_000
  }
}

/**
 * Estimate file size in bytes from bitrate and duration.
 */
export function estimateFileSize(
  bitratesBps: number,
  durationMs: number
): number {
  return Math.round((bitratesBps * (durationMs / 1000)) / 8)
}

/**
 * Format bytes to human-readable string (e.g., "12.4 MB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * Trigger a file download from an ArrayBuffer.
 */
export function downloadMP4(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'video/mp4' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.mp4') ? filename : `${filename}.mp4`
  document.body.appendChild(a)
  a.click()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Sanitize a filename by removing special characters.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100) || 'animation'
}
