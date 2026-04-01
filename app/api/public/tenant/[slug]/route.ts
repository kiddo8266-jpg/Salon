import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            color: true,
            category: true,
          }
        },
        staff: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                name: true,
                avatarUrl: true,
              }
            }
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Public Tenant GET Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
