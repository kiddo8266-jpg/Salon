import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const services = await prisma.service.findMany({
      where: { 
        tenantId: session.user.tenantId,
        isActive: true
      },
      orderBy: { category: 'asc' }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Service list error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, description, price, duration, category, color } = body

    if (!name || !price || !duration) {
      return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        category: category || 'General',
        color: color || '#7c3aed',
        isActive: true
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("POST Service Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
