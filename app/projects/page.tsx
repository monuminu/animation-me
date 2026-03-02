import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProjectsNav } from '@/components/projects/ProjectsNav'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { NewProjectButton } from '@/components/projects/NewProjectButton'

export const metadata = {
  title: 'My Projects — animation.me',
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/projects')
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      prompt: true,
      canvasPresetId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // Serialize dates to strings for the client component
  const serializedProjects = projects.map((p: typeof projects[number]) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-bg">
      <ProjectsNav />

      <main className="max-w-6xl mx-auto px-6 py-8 pt-22">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
            <p className="text-sm text-text-muted mt-1">
              {serializedProjects.length} {serializedProjects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <NewProjectButton />
        </div>

        {/* Grid */}
        <ProjectsGrid initialProjects={serializedProjects} />
      </main>
    </div>
  )
}
