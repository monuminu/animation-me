'use client'

import { Sparkles, LogOut, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { data: session, status } = useSession()

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

        {status === 'loading' ? (
          <div className="w-16 h-7 rounded-lg bg-bg-elevated animate-pulse" />
        ) : session?.user ? (
          <>
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              My Projects
            </Link>

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
          </>
        ) : (
          <Link href="/auth/signin">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
