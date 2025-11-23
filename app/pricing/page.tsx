import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

async function getPlans() {
  return await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })
}

export default async function PricingPage() {
  const plans = await getPlans()

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Select the perfect plan for your preparation journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.name === 'Standard Plan' ? 'border-primary border-2' : ''}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={`/api/checkout?planId=${plan.id}`} className="w-full">
                  <Button className="w-full" variant={plan.name === 'Standard Plan' ? 'default' : 'outline'}>
                    Purchase Plan
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

