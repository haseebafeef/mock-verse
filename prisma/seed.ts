import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user (password should be set via auth system)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mockverse.com' },
    update: {},
    create: {
      email: 'admin@mockverse.com',
      name: 'Admin User',
      role: 'admin',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created admin user')

  // Create mock test plans
  const plans = [
    {
      name: 'Basic Plan',
      description: 'Perfect for getting started with mock tests',
      price: 500.00,
      features: [
        'Access to 2 mock exams',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      name: 'Standard Plan',
      description: 'Most popular choice for serious candidates',
      price: 1000.00,
      features: [
        'Access to 5 mock exams',
        'Detailed analytics',
        'Subject-wise breakdown',
        'Priority email support',
      ],
    },
    {
      name: 'Premium Plan',
      description: 'Complete preparation package',
      price: 1500.00,
      features: [
        'Access to all 10+ mock exams',
        'Advanced analytics',
        'Performance tracking',
        '24/7 priority support',
        'Exam history access',
      ],
    },
  ]

  const createdPlans = []
  for (const plan of plans) {
    const created = await prisma.plan.upsert({
      where: { id: `plan-${plan.name.toLowerCase().replace(' ', '-')}` },
      update: plan,
      create: plan,
    })
    createdPlans.push(created)
  }

  console.log('✅ Created mock test plans')

  // Create sample exams
  const exams = [
    {
      name: 'BRAC University Admission Test - Mathematics',
      description: 'Comprehensive mathematics mock test covering all topics',
      subject: 'Mathematics',
      duration: 60,
      planId: createdPlans[0].id, // Basic Plan
    },
    {
      name: 'BRAC University Admission Test - English',
      description: 'English language and comprehension test',
      subject: 'English',
      duration: 45,
      planId: createdPlans[0].id, // Basic Plan
    },
    {
      name: 'BRAC University Admission Test - Full Mock',
      description: 'Complete admission test simulation',
      subject: 'Mixed',
      duration: 120,
      planId: createdPlans[1].id, // Standard Plan
    },
    {
      name: 'Advanced Mathematics Test',
      description: 'Advanced level mathematics questions',
      subject: 'Mathematics',
      duration: 90,
      planId: createdPlans[2].id, // Premium Plan
    },
    {
      name: 'Complete Admission Simulation',
      description: 'Full-length admission test with all subjects',
      subject: 'Mixed',
      duration: 180,
      planId: createdPlans[2].id, // Premium Plan
    },
  ]

  for (const exam of exams) {
    await prisma.exam.upsert({
      where: { id: `exam-${exam.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
      update: exam,
      create: exam,
    })
  }

  console.log('✅ Created sample exams')

  // Create sample questions for the first exam
  const mathExam = await prisma.exam.findFirst({
    where: { subject: 'Mathematics' },
  })

  if (mathExam) {
    const sampleQuestions = [
      {
        question: 'What is the value of 2 + 2?',
        optionA: '3',
        optionB: '4',
        optionC: '5',
        optionD: '6',
        correctAnswer: 'B',
      },
      {
        question: 'What is the square root of 16?',
        optionA: '2',
        optionB: '3',
        optionC: '4',
        optionD: '5',
        correctAnswer: 'C',
      },
      {
        question: 'What is 10% of 100?',
        optionA: '1',
        optionB: '10',
        optionC: '20',
        optionD: '100',
        correctAnswer: 'B',
      },
    ]

    for (const q of sampleQuestions) {
      await prisma.question.create({
        data: {
          ...q,
          examId: mathExam.id,
        },
      })
    }

    console.log('✅ Created sample questions')
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

