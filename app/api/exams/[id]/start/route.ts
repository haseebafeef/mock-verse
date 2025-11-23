import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Start an exam
export async function POST(
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

    // Check if exam exists and user has access
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { plan: true },
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

    // Check if there's an active exam session
    const activeExam = await prisma.userExam.findFirst({
      where: {
        userId,
        examId,
        submittedAt: null,
      },
    })

    if (activeExam) {
      return NextResponse.json({
        userExamId: activeExam.id,
        startedAt: activeExam.startedAt,
      })
    }

    // Get question count
    const questionCount = await prisma.question.count({
      where: { examId },
    })

    if (questionCount === 0) {
      return NextResponse.json(
        { error: 'This exam has no questions' },
        { status: 400 }
      )
    }

    // Create new exam session
    const userExam = await prisma.userExam.create({
      data: {
        userId,
        examId,
        totalQuestions: questionCount,
      },
    })

    return NextResponse.json({
      userExamId: userExam.id,
      startedAt: userExam.startedAt,
    })
  } catch (error) {
    console.error('Start exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

