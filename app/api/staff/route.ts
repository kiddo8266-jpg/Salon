import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const staff = await prisma.staff.findMany({
      where: { 
        tenantId: session.user.tenantId,
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        staffServices: {
          include: {
            service: true
          }
        }
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Staff list error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, email, password, specialization, bio } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: {
          tenantId: session.user.tenantId,
          email,
          name,
          password: hashedPassword,
          role: "STAFF"
        }
      })

      // 2. Create staff profile
      const staff = await tx.staff.create({
        data: {
          tenantId: session.user.tenantId,
          userId: user.id,
          specialization,
          bio
        },
        include: { 
           user: {
             select: {
               name: true,
               email: true,
               avatarUrl: true
             }
           }
        }
      })

      return staff
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("POST Staff Error:", error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "This email is already in use." }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
