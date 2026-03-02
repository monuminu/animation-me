'use client'

import { Sparkles, Plus } from 'lucide-react'
import { NewProjectButton } from './NewProjectButton'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
      <p className="text-sm text-text-muted text-center max-w-sm mb-6">
        Create your first animation project. Just describe what you want and let AI do the rest.
      </p>
      <NewProjectButton />
    </div>
  )
}
