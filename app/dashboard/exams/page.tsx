import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, Lock, Play } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getExams(userId: string) {
  // Get user's completed orders
  const userOrders = await prisma.order.findMany({
    where: {
      userId,
      status: 'completed',
    },
  })

  const purchasedPlanIds = userOrders.map((order) => order.planId)

  // Get all exams
  const exams = await prisma.exam.findMany({
    where: { isActive: true },
    include: {
      plan: true,
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Add access status
  const examsWithAccess = exams.map((exam) => ({
    ...exam,
    hasAccess: !exam.planId || purchasedPlanIds.includes(exam.planId),
  }))

  return examsWithAccess
}

export default async function ExamsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userId = (session.user as any).id
  const exams = await getExams(userId)

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Available Exams</h1>
          <Link href="/pricing">
            <Button variant="outline">View Plans</Button>
          </Link>
        </div>

        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No exams available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle>{exam.name}</CardTitle>
                  <CardDescription>{exam.description || exam.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration} minutes</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exam._count.questions} questions
                    </div>
                    {exam.plan && (
                      <div className="text-sm font-medium">
                        Plan: {exam.plan.name}
                      </div>
                    )}
                    {!exam.hasAccess && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Lock className="h-4 w-4" />
                        <span>Purchase required</span>
                      </div>
                    )}
                    <Link href={`/dashboard/exams/${exam.id}`}>
                      <Button
                        className="w-full"
                        variant={exam.hasAccess ? 'default' : 'outline'}
                        disabled={!exam.hasAccess}
                      >
                        {exam.hasAccess ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Exam
                          </>
                        ) : (
                          'Locked'
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

