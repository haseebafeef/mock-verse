'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { formatTime } from '@/lib/utils'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

interface Question {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  points: number
}

interface Exam {
  id: string
  name: string
  duration: number
  questions: Question[]
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [userExamId, setUserExamId] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadExam = useCallback(async () => {
    try {
      const response = await fetch(`/api/exams/${params.id}`)
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/pricing')
          return
        }
        throw new Error('Failed to load exam')
      }
      const data = await response.json()
      setExam(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading exam:', error)
      setIsLoading(false)
    }
  }, [params.id, router])

  const submitExam = useCallback(async () => {
    if (!userExamId || !exam || isSubmitting) return

    setIsSubmitting(true)

    try {
      const timeSpent = exam.duration * 60 - timeRemaining

      const response = await fetch(`/api/exams/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userExamId,
          answers,
          timeSpent,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit exam')

      const data = await response.json()
      router.push(`/dashboard/results/${data.userExamId}`)
    } catch (error) {
      console.error('Error submitting exam:', error)
      setIsSubmitting(false)
    }
  }, [userExamId, exam, isSubmitting, timeRemaining, answers, params.id, router])

  const handleAutoSubmit = useCallback(async () => {
    if (!userExamId || isSubmitting) return
    await submitExam()
  }, [userExamId, isSubmitting, submitExam])

  useEffect(() => {
    loadExam()
  }, [loadExam])

  useEffect(() => {
    if (startedAt && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [startedAt, timeRemaining, handleAutoSubmit])

  const startExam = async () => {
    try {
      const response = await fetch(`/api/exams/${params.id}/start`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to start exam')

      const data = await response.json()
      setUserExamId(data.userExamId)
      setStartedAt(new Date(data.startedAt))

      // Calculate time remaining
      if (exam) {
        const durationSeconds = exam.duration * 60
        setTimeRemaining(durationSeconds)
      }
    } catch (error) {
      console.error('Error starting exam:', error)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Exam not found</p>
        </div>
      </div>
    )
  }

  if (!userExamId) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{exam.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground">Duration: {exam.duration} minutes</p>
                <p className="text-muted-foreground">Questions: {exam.questions.length}</p>
              </div>
              <Button onClick={startExam} className="w-full" size="lg">
                Start Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const question = exam.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Timer and Progress */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1 text-center">
                  Question {currentQuestion + 1} of {exam.questions.length}
                </p>
              </div>
              <Button
                onClick={submitExam}
                disabled={isSubmitting}
                variant="destructive"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{question.question}</p>

            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="A" id="option-a" />
                  <Label htmlFor="option-a" className="flex-1 cursor-pointer">
                    {question.optionA}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="B" id="option-b" />
                  <Label htmlFor="option-b" className="flex-1 cursor-pointer">
                    {question.optionB}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="C" id="option-c" />
                  <Label htmlFor="option-c" className="flex-1 cursor-pointer">
                    {question.optionC}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="D" id="option-d" />
                  <Label htmlFor="option-d" className="flex-1 cursor-pointer">
                    {question.optionD}
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(exam.questions.length - 1, currentQuestion + 1)
                  )
                }
                disabled={currentQuestion === exam.questions.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation Grid */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {exam.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`p-2 border rounded ${
                    currentQuestion === index
                      ? 'bg-primary text-primary-foreground'
                      : answers[q.id]
                      ? 'bg-green-100 border-green-500'
                      : 'hover:bg-accent'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

