import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const clients = await prisma.client.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("GET Clients Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { fullName, email, phone, notes, tags } = body

    if (!fullName) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 })
    }

    // Check if client already exists with this email for the same tenant
    if (email) {
      const existing = await prisma.client.findUnique({
        where: {
          tenantId_email: {
            tenantId: session.user.tenantId,
            email: email
          }
        }
      })
      if (existing) {
        return NextResponse.json({ error: "A client with this email already exists" }, { status: 409 })
      }
    }

    const client = await prisma.client.create({
      data: {
        tenantId: session.user.tenantId,
        fullName,
        email,
        phone,
        notes,
        tags: tags || []
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("POST Client Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
