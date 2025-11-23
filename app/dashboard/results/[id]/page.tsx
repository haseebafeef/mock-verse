import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, XCircle, BarChart3, Clock } from 'lucide-react'
import { formatTime } from '@/lib/utils'

async function getResult(userExamId: string, userId: string) {
  const userExam = await prisma.userExam.findFirst({
    where: {
      id: userExamId,
      userId,
    },
    include: {
      exam: true,
      userAnswers: {
        include: {
          question: true,
        },
      },
    },
  })

  if (!userExam) {
    return null
  }

  // Calculate subject-wise breakdown
  const subjectBreakdown: Record<string, { correct: number; total: number }> = {}
  
  userExam.userAnswers.forEach((answer) => {
    const subject = userExam.exam.subject
    if (!subjectBreakdown[subject]) {
      subjectBreakdown[subject] = { correct: 0, total: 0 }
    }
    subjectBreakdown[subject].total++
    if (answer.isCorrect) {
      subjectBreakdown[subject].correct++
    }
  })

  return { userExam, subjectBreakdown }
}

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userId = (session.user as any).id
  const result = await getResult(params.id, userId)

  if (!result) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Result not found</p>
        </div>
      </div>
    )
  }

  const { userExam, subjectBreakdown } = result

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Exam Results</h1>

          {/* Score Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{userExam.exam.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {userExam.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {userExam.correctAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {userExam.wrongAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Wrong</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {userExam.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
              {userExam.timeSpent && (
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time Spent: {formatTime(userExam.timeSpent)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject-wise Breakdown */}
          {Object.keys(subjectBreakdown).length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Subject-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(subjectBreakdown).map(([subject, stats]) => {
                    const percentage = Math.round((stats.correct / stats.total) * 100)
                    return (
                      <div key={subject}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{subject}</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.correct}/{stats.total} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answer Review */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userExam.userAnswers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className={`p-4 border rounded-lg ${
                      answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          Question {index + 1}: {answer.question.question}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Your Answer: </span>
                            <span className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {answer.selectedAnswer}
                            </span>
                          </div>
                          {!answer.isCorrect && (
                            <div>
                              <span className="font-medium">Correct Answer: </span>
                              <span className="text-green-700">
                                {answer.question.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          <div>A. {answer.question.optionA}</div>
                          <div>B. {answer.question.optionB}</div>
                          <div>C. {answer.question.optionC}</div>
                          <div>D. {answer.question.optionD}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4">
            <Link href="/dashboard/exams">
              <Button>Take Another Exam</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

