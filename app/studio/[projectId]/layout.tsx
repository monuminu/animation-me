'use client'

import { useEffect } from 'react'
import { useProjectStore } from '@/stores/project-store'

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { projectId: string }
}) {
  const setProjectId = useProjectStore((s) => s.setProjectId)

  useEffect(() => {
    setProjectId(params.projectId)
  }, [params.projectId, setProjectId])

  return <>{children}</>
}
