'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'

export function NewProjectButton() {
  const router = useRouter()

  const handleNewProject = () => {
    const id = nanoid(12)
    router.push(`/studio/${id}`)
  }

  return (
    <Button variant="primary" size="md" onClick={handleNewProject}>
      <Plus className="w-4 h-4" />
      New Project
    </Button>
  )
}
