'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateId } from '@/lib/utils'

export default function StudioRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/studio/${generateId()}`)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="animate-pulse text-text-secondary">Loading studio...</div>
    </div>
  )
}
