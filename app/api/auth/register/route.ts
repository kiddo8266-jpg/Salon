import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { businessName, businessSlug, adminName, email, password } = await req.json()

    // 1. Validation
    if (!businessName || !businessSlug || !adminName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields rituals" }, { status: 400 })
    }

    // 2. Check if Email or Slug exists
    // Using findUnique since email is now globally unique
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered in the ecosystem." }, { status: 409 })
    }

    const existingTenant = await prisma.tenant.findUnique({ where: { slug: businessSlug } })
    if (existingTenant) {
      return NextResponse.json({ error: "Workspace slug already exists. Please choose another path." }, { status: 409 })
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
          // Default to Free Plan upon signup
          planType: 'FREE',
          isActive: true
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
      { 
        message: "SaaS Space created successfully.", 
        tenantId: result.tenant.id,
        slug: result.tenant.slug 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("Registration Error:", error)
    return NextResponse.json({ error: "Internal Server Ritual Failure" }, { status: 500 })
  }
}
