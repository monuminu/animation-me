import type { Scene } from '@/types'

/**
 * Resolve the content duration of a scene.
 * Returns TTS-set duration, or 5000ms as a fallback if TTS hasn't run yet.
 */
export function getResolvedDuration(scene: Scene): number {
  return scene.duration ?? 5000
}

/**
 * Get the effective duration of a scene including its delay.
 * The delay is a pause after the scene content finishes, before the next scene starts.
 */
export function getEffectiveSceneDuration(scene: Scene): number {
  return getResolvedDuration(scene) + (scene.delay ?? 0)
}

/**
 * Compute the total duration of all scenes including their delays.
 */
export function computeTotalDuration(scenes: Scene[]): number {
  return scenes.reduce((sum, scene) => sum + getEffectiveSceneDuration(scene), 0)
}

/**
 * Check whether all scenes have their final duration set by TTS.
 */
export function allDurationsResolved(scenes: Scene[]): boolean {
  return scenes.every((scene) => scene.duration !== undefined)
}

/**
 * Given an array of scenes and a time in milliseconds,
 * returns the current scene index, progress within the scene content,
 * elapsed time before the scene, whether we're in the delay phase,
 * and the raw time within the scene's full window (content + delay).
 */
export function getSceneAtTime(
  scenes: Scene[],
  timeMs: number
): {
  sceneIndex: number
  progress: number
  elapsed: number
  isInDelay: boolean
  sceneTime: number
} {
  let elapsed = 0

  for (let i = 0; i < scenes.length; i++) {
    const effectiveDuration = getEffectiveSceneDuration(scenes[i])
    if (timeMs < elapsed + effectiveDuration) {
      const sceneTime = timeMs - elapsed
      const contentDuration = getResolvedDuration(scenes[i])
      const isInDelay = sceneTime >= contentDuration
      // During delay, progress is frozen at 1 (last frame)
      const progress = isInDelay
        ? 1
        : Math.min(sceneTime / contentDuration, 1)
      return {
        sceneIndex: i,
        progress,
        elapsed,
        isInDelay,
        sceneTime,
      }
    }
    elapsed += effectiveDuration
  }

  // Past the end - return last scene at progress 1
  return {
    sceneIndex: Math.max(0, scenes.length - 1),
    progress: 1,
    elapsed,
    isInDelay: false,
    sceneTime: 0,
  }
}
