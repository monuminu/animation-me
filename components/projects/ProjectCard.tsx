'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Trash2, ExternalLink, Clock } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    prompt: string
    createdAt: string
    updatedAt: string
  }
  onDelete: (id: string) => void
}

function timeAgo(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = now - date

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleOpen = () => {
    router.push(`/studio/${project.id}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete(project.id)
      }
    } catch {
      // Silently fail
    } finally {
      setDeleting(false)
      setShowMenu(false)
    }
  }

  return (
    <div
      onClick={handleOpen}
      className="group relative bg-bg-secondary border border-border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-border-hover hover:bg-bg-elevated hover:shadow-lg hover:shadow-black/10"
    >
      {/* Menu trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />
          <div className="absolute top-10 right-3 z-20 bg-bg-elevated border border-border rounded-lg shadow-xl shadow-black/20 py-1 min-w-[140px]">
            <button
              onClick={handleOpen}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </>
      )}

      {/* Content */}
      <div className="pr-8">
        <h3 className="font-medium text-sm text-text-primary truncate mb-1.5">
          {project.title}
        </h3>
        {project.prompt && (
          <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
            {project.prompt}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}
