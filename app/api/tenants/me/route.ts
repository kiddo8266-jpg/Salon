import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId }
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("GET Tenant Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { 
      name, 
      description, 
      address, 
      phone, 
      email, 
      website, 
      brandColor, 
      socialLinks, 
      businessHours 
    } = body

    const tenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        brandColor,
        socialLinks,
        businessHours
      }
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("PATCH Tenant Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
