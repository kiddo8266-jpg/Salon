import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = params
    const body = await req.json()
    const { name, description, price, duration, category, color, isActive } = body

    const service = await prisma.service.updateMany({
      where: { 
        id, 
        tenantId: session.user.tenantId 
      },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        category,
        color,
        isActive
      }
    })

    if (service.count === 0) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PATCH Service Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = params

    // Instead of actual deletion, we marks it as inactive to preserve history
    const service = await prisma.service.updateMany({
      where: { 
        id, 
        tenantId: session.user.tenantId 
      },
      data: { isActive: false }
    })

    if (service.count === 0) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("DELETE Service Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
