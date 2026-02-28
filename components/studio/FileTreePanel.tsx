'use client'

import { useState } from 'react'
import { FolderOpen, FileCode2, ChevronRight, ChevronDown, Code2 } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CodeViewer } from './CodeViewer'
import type { FileTreeNode } from '@/types'

function FileTreeItem({ node, depth = 0 }: { node: FileTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const { selectedFile, setSelectedFile } = useProjectStore()

  const isFolder = node.type === 'folder'
  const isSelected = selectedFile === node.path

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded)
          } else {
            setSelectedFile(node.path)
          }
        }}
        className={cn(
          'w-full flex items-center gap-1.5 py-1 px-2 text-xs rounded-md transition-colors',
          isSelected
            ? 'bg-accent/10 text-accent'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown className="w-3 h-3 flex-shrink-0 text-text-muted" />
          ) : (
            <ChevronRight className="w-3 h-3 flex-shrink-0 text-text-muted" />
          )
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}

        {isFolder ? (
          <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 text-yellow-500/80" />
        ) : (
          <FileCode2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-400/80" />
        )}

        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && expanded && node.children?.map((child) => (
        <FileTreeItem key={child.path} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export function FileTreePanel() {
  const { fileTree, selectedFile, animationConfig } = useProjectStore()

  // Find selected file content
  const findFile = (nodes: FileTreeNode[], path: string): FileTreeNode | undefined => {
    for (const node of nodes) {
      if (node.path === path) return node
      if (node.children) {
        const found = findFile(node.children, path)
        if (found) return found
      }
    }
  }

  const selectedNode = selectedFile ? findFile(fileTree, selectedFile) : undefined

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* Header */}
      <div className="h-10 flex items-center px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Files</span>
        </div>
      </div>

      {fileTree.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-xs text-text-muted text-center">
            Generated scene files will appear here
          </p>
        </div>
      ) : (
        <>
          {/* File Tree */}
          <div className="py-2 px-1 border-b border-border">
            <ScrollArea className="max-h-[200px]">
              {fileTree.map((node) => (
                <FileTreeItem key={node.path} node={node} />
              ))}
            </ScrollArea>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 min-h-0">
            {selectedNode?.content ? (
              <CodeViewer code={selectedNode.content} language={selectedNode.language || 'tsx'} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-text-muted">Select a file to view code</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
