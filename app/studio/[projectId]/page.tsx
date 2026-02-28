'use client'

import { useEffect } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { StudioLayout } from '@/components/studio/StudioLayout'

export default function StudioPage({ params }: { params: { projectId: string } }) {
  const { setProjectId, initialPrompt } = useProjectStore()

  useEffect(() => {
    setProjectId(params.projectId)
  }, [params.projectId, setProjectId])

  return <StudioLayout />
}
