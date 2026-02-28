'use client'

import { useRef, useEffect } from 'react'

/**
 * Scene-scoped callback scheduling hook.
 * Fires callbacks when the scene's progress crosses specific thresholds.
 *
 * Callbacks fire at most once per threshold per forward pass.
 * Resets when progress goes back below the threshold (e.g., on loop).
 *
 * @param progress  - Current scene progress (0–1)
 * @param callbacks - Map of progress thresholds to callbacks: `{ 0.5: () => playSfx() }`
 *
 * Usage:
 * ```tsx
 * useSceneTimer(progress, {
 *   0.0: () => console.log('Scene started'),
 *   0.5: () => playSound('whoosh'),
 *   1.0: () => trackEvent('scene_complete'),
 * })
 * ```
 */
export function useSceneTimer(
  progress: number,
  callbacks: Record<number, () => void>
) {
  const firedRef = useRef<Set<number>>(new Set())
  const prevProgressRef = useRef<number>(0)

  useEffect(() => {
    // Detect loop reset (progress jumped backward significantly)
    if (progress < prevProgressRef.current - 0.1) {
      firedRef.current.clear()
    }
    prevProgressRef.current = progress

    const thresholds = Object.keys(callbacks).map(Number).sort((a, b) => a - b)

    for (const threshold of thresholds) {
      if (progress >= threshold && !firedRef.current.has(threshold)) {
        firedRef.current.add(threshold)
        try {
          callbacks[threshold]()
        } catch {
          // Don't let callback errors break the animation loop
        }
      }
    }
  }, [progress, callbacks])
}
