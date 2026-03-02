import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequiredSession } from '@/lib/auth-helpers'

// GET /api/projects — list all projects for the current user
export async function GET() {
  try {
    const session = await getRequiredSession()

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

    return NextResponse.json(projects)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to list projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()

    const project = await prisma.project.create({
      data: {
        id: body.id,
        userId: session.user.id,
        title: body.title || 'Untitled Project',
        prompt: body.prompt || '',
        animationConfig: body.animationConfig ?? undefined,
        messages: body.messages ?? [],
        canvasPresetId: body.canvasPresetId || 'full-size',
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
