'use client'

import { useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from './EmptyState'

interface Project {
  id: string
  title: string
  prompt: string
  canvasPresetId: string
  createdAt: string
  updatedAt: string
}

interface ProjectsGridProps {
  initialProjects: Project[]
}

export function ProjectsGrid({ initialProjects }: ProjectsGridProps) {
  const [projects, setProjects] = useState(initialProjects)

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  if (projects.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
