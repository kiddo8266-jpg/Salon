import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payments = await prisma.payment.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        appointment: {
          include: {
            client: true,
            service: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("GET Payments Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { appointmentId, amount, method, note } = body

    if (!appointmentId || !amount) {
      return NextResponse.json({ error: "Appointment ID and amount are required" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the payment
      const payment = await tx.payment.create({
        data: {
          tenantId: session.user.tenantId,
          appointmentId: appointmentId,
          amount: parseFloat(amount),
          method: method || 'CASH',
          status: 'PAID',
          note: note,
          paidAt: new Date()
        },
        include: {
          appointment: true
        }
      })

      // 2. Update appointment status to COMPLETED
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' }
      })

      // 3. Update client stats (incremental update)
      await tx.client.update({
        where: { id: payment.appointment.clientId },
        data: {
          totalSpent: { increment: parseFloat(amount) },
          totalVisits: { increment: 1 }
        }
      })

      return payment
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("POST Payment Error:", error)
    if (error.code === 'P2002') return NextResponse.json({ error: "A payment already exists for this appointment" }, { status: 409 })
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
