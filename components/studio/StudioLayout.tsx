'use client'

import { useProjectStore } from '@/stores/project-store'
import { TopBar } from './TopBar'
import { ChatPanel } from './ChatPanel'
import { PreviewPanel } from './PreviewPanel'
import { FileTreePanel } from './FileTreePanel'
import { BottomBar } from './BottomBar'
import { useResizePanel } from '@/hooks/useResizePanel'

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
    </div>
  )
}
