import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, stripeConfig } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentId: paymentIntent.id },
    include: { user: true },
  })

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: "PAYMENT_COMPLETED",
        resource: "payment",
        details: {
          paymentId: payment.id,
          amount: payment.amount,
          type: payment.type,
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Send notification (implement your notification logic here)
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: "Payment Successful",
        message: `Your payment of $${(payment.amount / 100).toFixed(2)} has been processed successfully.`,
        type: "payment",
      },
    })
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentId: paymentIntent.id },
  })

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: "PAYMENT_FAILED",
        resource: "payment",
        details: {
          paymentId: payment.id,
          amount: payment.amount,
          type: payment.type,
          error: paymentIntent.last_payment_error?.message,
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Send notification
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: "Payment Failed",
        message: `Your payment of $${(payment.amount / 100).toFixed(2)} could not be processed. Please try again.`,
        type: "payment",
      },
    })
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    })

    if (subscription) {
      // Create payment record for subscription payment
      await prisma.payment.create({
        data: {
          userId: subscription.userId,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          type: "SUBSCRIPTION",
          status: "COMPLETED",
          description: `Subscription payment - Invoice ${invoice.number}`,
          metadata: {
            invoiceId: invoice.id,
            subscriptionId: subscription.id,
          },
        },
      })

      // Send notification
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          title: "Subscription Payment Successful",
          message: `Your subscription payment of $${(invoice.amount_paid / 100).toFixed(2)} has been processed.`,
          type: "subscription",
        },
      })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    })

    if (subscription) {
      // Send notification
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          title: "Subscription Payment Failed",
          message: `Your subscription payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
          type: "subscription",
        },
      })
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: subscription.status as 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID',
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: "CANCELED",
      },
    })

    // Send notification
    await prisma.notification.create({
      data: {
        userId: dbSubscription.userId,
        title: "Subscription Canceled",
        message: "Your subscription has been canceled and will not renew.",
        type: "subscription",
      },
    })
  }
}