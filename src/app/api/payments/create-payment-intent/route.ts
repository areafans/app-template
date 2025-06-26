import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createPaymentIntentSchema = z.object({
  amount: z.number().min(50, "Minimum amount is $0.50"), // Minimum 50 cents
  currency: z.string().default("usd"),
  type: z.enum(["ONE_TIME", "DONATION"]),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, currency, type, description, metadata } = createPaymentIntentSchema.parse(body)

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: session.user.id,
        type,
        ...metadata,
      },
      description: description || `Payment from ${session.user.name || session.user.email}`,
    })

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        stripePaymentId: paymentIntent.id,
        amount,
        currency,
        type,
        description,
        metadata: metadata || {},
        status: "PENDING",
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PAYMENT_INTENT_CREATED",
        resource: "payment",
        details: {
          paymentId: payment.id,
          amount,
          type,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Payment intent creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}