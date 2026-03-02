import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequiredSession } from '@/lib/auth-helpers'

// GET /api/projects/[id] — get a single project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getRequiredSession()

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to get project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/projects/[id] — update a project (upsert)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getRequiredSession()
    const body = await request.json()

    const project = await prisma.project.upsert({
      where: { id: params.id },
      update: {
        title: body.title,
        prompt: body.prompt,
        animationConfig: body.animationConfig ?? undefined,
        messages: body.messages ?? undefined,
        canvasPresetId: body.canvasPresetId,
      },
      create: {
        id: params.id,
        userId: session.user.id,
        title: body.title || 'Untitled Project',
        prompt: body.prompt || '',
        animationConfig: body.animationConfig ?? undefined,
        messages: body.messages ?? [],
        canvasPresetId: body.canvasPresetId || 'full-size',
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to update project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] — delete a project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getRequiredSession()

    // Ensure the project belongs to the user
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to delete project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
