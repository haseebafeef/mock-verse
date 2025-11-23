import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { CheckCircle, BookOpen, BarChart3, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Prepare for BRAC University
          <br />
          <span className="text-primary">Admission Tests</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Take comprehensive mock exams, track your progress, and boost your confidence
          with our advanced analytics and detailed performance insights.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Plans</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose MockVerse?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Comprehensive Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access a wide range of mock tests covering all subjects and difficulty levels.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get insights into your performance with subject-wise breakdowns and progress tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Real Exam Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice with timed exams that simulate the actual admission test environment.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get immediate feedback with auto-graded answers and detailed explanations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Admission Test?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students preparing for BRAC University admission tests.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">Start Your Journey</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MockVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

