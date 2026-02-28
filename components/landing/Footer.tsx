'use client'

import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <div className="w-5 h-5 rounded-md bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-accent" />
          </div>
          animation.me
        </div>
        <p className="text-xs text-text-muted">
          Animate everything. Just describe it.
        </p>
      </div>
    </footer>
  )
}
