import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('orderId')

    if (!sessionId || !orderId) {
      return NextResponse.redirect(new URL('/pricing?error=missing_params', request.url))
    }

    // Verify Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.redirect(new URL('/pricing?error=payment_failed', request.url))
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' },
      include: { plan: true },
    })

    // Verify user owns this order
    if (order.userId !== (session.user as any).id) {
      return NextResponse.redirect(new URL('/pricing?error=unauthorized', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard?purchase=success', request.url))
  } catch (error) {
    console.error('Checkout success error:', error)
    return NextResponse.redirect(new URL('/pricing?error=server_error', request.url))
  }
}

