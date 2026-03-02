'use client'

import { useProjectStore } from '@/stores/project-store'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { TopBar } from './TopBar'
import { ChatPanel } from './ChatPanel'
import { PreviewPanel } from './PreviewPanel'
import { FileTreePanel } from './FileTreePanel'
import { BottomBar } from './BottomBar'
import { PreviewModal } from './PreviewModal'
import { ExportModal } from './ExportModal'
import { useResizePanel } from '@/hooks/useResizePanel'

function SignInBanner() {
  const { data: session, status } = useSession()

  if (status === 'loading' || session?.user) return null

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-accent/10 border-b border-accent/20 text-xs text-accent">
      <LogIn className="w-3.5 h-3.5" />
      <span>Your work won&apos;t be saved.</span>
      <Link
        href="/auth/signin"
        className="font-medium underline underline-offset-2 hover:text-accent-hover transition-colors"
      >
        Sign in to save your projects
      </Link>
    </div>
  )
}

export function StudioLayout() {
  const { chatPanelWidth, fileTreePanelWidth, isFileTreeOpen, setChatPanelWidth, setFileTreePanelWidth } = useProjectStore()

  const chatResize = useResizePanel({
    initialWidth: chatPanelWidth,
    minWidth: 260,
    maxWidth: 500,
    onResize: setChatPanelWidth,
    direction: 'right',
  })

  const fileTreeResize = useResizePanel({
    initialWidth: fileTreePanelWidth,
    minWidth: 220,
    maxWidth: 450,
    onResize: setFileTreePanelWidth,
    direction: 'left',
  })

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      <TopBar />
      <SignInBanner />

      <div className="flex-1 flex min-h-0">
        {/* Chat Panel */}
        <div
          className="flex-shrink-0 border-r border-border"
          style={{ width: chatResize.width }}
        >
          <ChatPanel />
        </div>

        {/* Chat resize handle */}
        <div
          className="w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 transition-colors flex-shrink-0"
          onMouseDown={chatResize.onMouseDown}
        />

        {/* Preview Panel */}
        <div className="flex-1 min-w-0">
          <PreviewPanel />
        </div>

        {/* File Tree Panel - collapsible */}
        {isFileTreeOpen && (
          <>
            {/* FileTree resize handle */}
            <div
              className="w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 transition-colors flex-shrink-0"
              onMouseDown={fileTreeResize.onMouseDown}
            />

            {/* File Tree Panel */}
            <div
              className="flex-shrink-0 border-l border-border animate-slide-in-right"
              style={{ width: fileTreeResize.width }}
            >
              <FileTreePanel />
            </div>
          </>
        )}
      </div>

      <BottomBar />

      {/* Full-screen preview modal */}
      <PreviewModal />

      {/* Export modal */}
      <ExportModal />
    </div>
  )
}
