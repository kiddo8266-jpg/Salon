import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addMonths } from "date-fns"

const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  STARTER: 29,
  PROFESSIONAL: 79,
  ENTERPRISE: 199,
}

export async function POST() {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized ritual" }, { status: 401 })
  }

  try {
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true }
    })

    const now = new Date()
    const nextMonth = addMonths(now, 1)

    const invoices = await Promise.all(
      tenants.map(async (tenant) => {
        // Check if invoice already exists for this tenant this month to avoid duplicates
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const existing = await prisma.invoice.findFirst({
          where: {
            tenantId: tenant.id,
            billingDate: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        })

        if (existing) return null

        return prisma.invoice.create({
          data: {
            tenantId: tenant.id,
            amount: PLAN_PRICES[tenant.planType] || 0,
            planType: tenant.planType,
            status: tenant.planType === 'FREE' ? 'PAID' : 'UNPAID',
            dueDate: nextMonth,
            periodStart: startOfMonth,
            periodEnd: endOfMonth,
          }
        })
      })
    )

    const createdCount = invoices.filter(Boolean).length

    return NextResponse.json({ 
      success: true, 
      count: createdCount,
      message: `Successfully synchronized rites for ${createdCount} tenants.` 
    })
  } catch (error) {
    console.error("Billing Engine Error:", error)
    return NextResponse.json({ error: "Ritual execution failed" }, { status: 500 })
  }
}

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    try {
      const invoices = await prisma.invoice.findMany({
        include: {
          tenant: {
            select: { name: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
  
      return NextResponse.json(invoices)
    } catch (error) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
    }
}
