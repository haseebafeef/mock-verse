import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateScore } from '@/lib/utils'

// POST - Submit exam answers
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
    const { userExamId, answers, timeSpent } = await request.json()

    if (!userExamId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user exam
    const userExam = await prisma.userExam.findFirst({
      where: {
        id: userExamId,
        userId,
        examId,
        submittedAt: null,
      },
    })

    if (!userExam) {
      return NextResponse.json(
        { error: 'Exam session not found or already submitted' },
        { status: 404 }
      )
    }

    // Get all questions for this exam
    const questions = await prisma.question.findMany({
      where: { examId },
    })

    let correctCount = 0
    let wrongCount = 0

    // Process answers
    const answerPromises = Object.entries(answers).map(async ([questionId, selectedAnswer]) => {
      const question = questions.find((q) => q.id === questionId)
      if (!question) return

      const isCorrect = question.correctAnswer === selectedAnswer

      if (isCorrect) {
        correctCount++
      } else {
        wrongCount++
      }

      // Save answer
      return prisma.userAnswer.create({
        data: {
          userExamId,
          questionId,
          selectedAnswer: selectedAnswer as string,
          isCorrect,
          userId,
        },
      })
    })

    await Promise.all(answerPromises)

    // Calculate score
    const score = calculateScore(questions.length, correctCount)

    // Update user exam
    const updatedUserExam = await prisma.userExam.update({
      where: { id: userExamId },
      data: {
        submittedAt: new Date(),
        timeSpent,
        score,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
      },
    })

    return NextResponse.json({
      userExamId: updatedUserExam.id,
      score,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      totalQuestions: questions.length,
    })
  } catch (error) {
    console.error('Submit exam error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

