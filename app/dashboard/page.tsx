import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, BarChart3, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

async function getDashboardData(userId: string) {
  const [orders, userExams, exams] = await Promise.all([
    prisma.order.findMany({
      where: { userId, status: 'completed' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.userExam.findMany({
      where: { userId },
      include: { exam: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.exam.findMany({
      where: { isActive: true },
      include: {
        plan: true,
        _count: { select: { questions: true } },
      },
      take: 3,
    }),
  ])

  return { orders, userExams, exams }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userId = (session.user as any).id
  const { orders, userExams, exams } = await getDashboardData(userId)

  const purchasedPlanIds = orders.map((order) => order.planId)

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchased Plans</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exams Taken</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userExams.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userExams.length > 0
                  ? Math.round(
                      userExams.reduce((sum, exam) => sum + (exam.score || 0), 0) /
                        userExams.length
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Exams</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams.filter((exam) => !exam.planId || purchasedPlanIds.includes(exam.planId))
                  .length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Exams */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exam Results</CardTitle>
              <CardDescription>Your latest exam attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {userExams.length === 0 ? (
                <p className="text-muted-foreground">No exams taken yet</p>
              ) : (
                <div className="space-y-4">
                  {userExams.map((userExam) => (
                    <div
                      key={userExam.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{userExam.exam.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {userExam.submittedAt
                            ? new Date(userExam.submittedAt).toLocaleDateString()
                            : 'In Progress'}
                        </p>
                      </div>
                      {userExam.score !== null && (
                        <div className="text-right">
                          <p className="font-bold text-lg">{userExam.score}%</p>
                          <p className="text-sm text-muted-foreground">
                            {userExam.correctAnswers}/{userExam.totalQuestions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/dashboard/exams" className="mt-4 block">
                <Button variant="outline" className="w-full">
                  View All Exams
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Plans</CardTitle>
              <CardDescription>Purchased mock test plans</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div>
                  <p className="text-muted-foreground mb-4">No plans purchased yet</p>
                  <Link href="/pricing">
                    <Button>Browse Plans</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{order.plan.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(order.amount)} •{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href="/dashboard/exams">
                <Button>Take an Exam</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline">Browse Plans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

