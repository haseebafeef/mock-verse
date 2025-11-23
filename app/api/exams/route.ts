import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get available exams for user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const purchasedOnly = searchParams.get('purchased') === 'true'

    // Get user's completed orders
    const userOrders = await prisma.order.findMany({
      where: {
        userId,
        status: 'completed',
      },
      include: { plan: true },
    })

    const purchasedPlanIds = userOrders.map((order) => order.planId)

    // Get exams
    let exams
    if (purchasedOnly) {
      exams = await prisma.exam.findMany({
        where: {
          isActive: true,
          planId: { in: purchasedPlanIds },
        },
        include: {
          plan: true,
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      exams = await prisma.exam.findMany({
        where: { isActive: true },
        include: {
          plan: true,
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    // Add access status
    const examsWithAccess = exams.map((exam) => ({
      ...exam,
      hasAccess: !exam.planId || purchasedPlanIds.includes(exam.planId),
    }))

    return NextResponse.json(examsWithAccess)
  } catch (error) {
    console.error('Get exams error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

