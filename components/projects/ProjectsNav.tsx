'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function ProjectsNav() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
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

        {session?.user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted truncate max-w-[150px]">
              {session.user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="!px-2 text-text-muted hover:text-text-primary"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
