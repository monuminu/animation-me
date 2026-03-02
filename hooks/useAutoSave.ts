'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useProjectStore } from '@/stores/project-store'

const DEBOUNCE_MS = 1500

/**
 * Auto-saves the current project to the server after changes settle (1.5s debounce).
 * Only saves when the user is authenticated.
 */
export function useAutoSave() {
  const { data: session } = useSession()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(false)

  const projectId = useProjectStore((s) => s.projectId)
  const projectTitle = useProjectStore((s) => s.projectTitle)
  const initialPrompt = useProjectStore((s) => s.initialPrompt)
  const animationConfig = useProjectStore((s) => s.animationConfig)
  const messages = useProjectStore((s) => s.messages)
  const canvasPresetId = useProjectStore((s) => s.canvasPresetId)
  const setSaveStatus = useProjectStore((s) => s.setSaveStatus)

  useEffect(() => {
    // Skip auto-save when not authenticated or no project open
    if (!session?.user?.id || !projectId) return

    // Skip the initial mount to prevent a save immediately on load
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }

    // Clear previous debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')

      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: projectTitle,
            prompt: initialPrompt,
            animationConfig,
            messages,
            canvasPresetId,
          }),
        })

        if (response.ok) {
          setSaveStatus('saved')
        } else {
          setSaveStatus('error')
        }
      } catch {
        setSaveStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectTitle, initialPrompt, animationConfig, messages, canvasPresetId])
}
