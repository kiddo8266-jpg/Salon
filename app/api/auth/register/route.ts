import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { businessName, businessSlug, adminName, email, password } = await req.json()

    // 1. Validation
    if (!businessName || !businessSlug || !adminName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 2. Check if Email or Slug exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const existingTenant = await prisma.tenant.findUnique({ where: { slug: businessSlug } })
    if (existingTenant) {
      return NextResponse.json({ error: "Workspace slug already exists. Please choose another." }, { status: 409 })
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12)

    // 4. Atomic Transaction: Create Tenant + Admin User
    const result = await prisma.$transaction(async (tx: any) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: businessName,
          slug: businessSlug,
        }
      })

      // Create Admin User bound to Tenant
      const user = await tx.user.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: "OWNER",
          tenantId: tenant.id
        }
      })

      return { tenant, user }
    })

    return NextResponse.json(
      { message: "Workspace created successfully", tenantId: result.tenant.id },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("Registration Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
