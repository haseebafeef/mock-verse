import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get exam details with questions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const examId = params.id

    // Check if user has access
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        plan: true,
        questions: {
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            points: true,
          },
        },
      },
    })

    if (!exam || !exam.isActive) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Check access
    if (exam.planId) {
      const hasAccess = await prisma.order.findFirst({
        where: {
          userId,
          planId: exam.planId,
          status: 'completed',
        },
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'You need to purchase a plan to access this exam' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error('Get exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

