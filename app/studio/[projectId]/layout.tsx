'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useProjectStore } from '@/stores/project-store'
import { useAutoSave } from '@/hooks/useAutoSave'

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { projectId: string }
}) {
  const { data: session } = useSession()
  const setProjectId = useProjectStore((s) => s.setProjectId)
  const hydrateFromServer = useProjectStore((s) => s.hydrateFromServer)
  const [loaded, setLoaded] = useState(false)

  // Activate auto-save (only saves when authenticated)
  useAutoSave()

  useEffect(() => {
    setProjectId(params.projectId)

    // If user is authenticated, try to load the project from the DB
    if (session?.user?.id) {
      fetch(`/api/projects/${params.projectId}`)
        .then((res) => {
          if (res.ok) return res.json()
          return null
        })
        .then((project) => {
          if (project) {
            hydrateFromServer({
              projectId: project.id,
              title: project.title,
              prompt: project.prompt,
              animationConfig: project.animationConfig,
              messages: project.messages || [],
              canvasPresetId: project.canvasPresetId,
            })
          }
          setLoaded(true)
        })
        .catch(() => {
          setLoaded(true)
        })
    } else {
      setLoaded(true)
    }
  }, [params.projectId, session?.user?.id, setProjectId, hydrateFromServer])

  // Don't render children until we've attempted to load from the server
  // This prevents a flash of empty content before hydration
  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading project...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
