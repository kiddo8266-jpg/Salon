import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const media = await prisma.media.findMany({
      where: { 
        tenantId: session.user.tenantId 
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error("GET Media Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
