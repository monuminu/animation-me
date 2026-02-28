'use client'

import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-base tracking-tight">animation.me</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/studio" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
          Studio
        </Link>
        <Button variant="secondary" size="sm">
          Sign In
        </Button>
      </div>
    </nav>
  )
}
