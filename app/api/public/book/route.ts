import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addMinutes } from "date-fns"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      tenantId, 
      serviceId, 
      staffId, 
      startTime, 
      fullName, 
      email, 
      phone, 
      notes 
    } = body

    if (!tenantId || !serviceId || !staffId || !startTime || !fullName || !email || !phone) {
      return NextResponse.json({ error: "Missing required booking information" }, { status: 400 })
    }

    // 1. Fetch Service & Tenant
    const service = await prisma.service.findUnique({
      where: { id: serviceId, tenantId, isActive: true }
    })

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 })

    // 2. Client Management (Match by Email per Tenant)
    let client = await prisma.client.findUnique({
      where: { 
        tenantId_email: { tenantId, email } 
      }
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          tenantId,
          fullName,
          email,
          phone,
          notes: `Public Guest Registration. Initial notes: ${notes || 'None'}`
        }
      })
    }

    // 3. Collision Check (Same as internal booking)
    const start = new Date(startTime)
    const end = addMinutes(start, service.duration)

    const collision = await prisma.appointment.findFirst({
      where: {
        staffId,
        tenantId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } }
        ]
      }
    })

    if (collision) {
      return NextResponse.json({ 
        error: "This time slot is no longer available. Please choose another time or staff member." 
      }, { status: 409 })
    }

    // 4. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        clientId: client.id,
        staffId,
        serviceId,
        startTime: start,
        endTime: end,
        notes: notes || "Public booking.",
        status: 'CONFIRMED' // Public guest bookings are automatically confirmed for now
      }
    })

    // 5. Update Client Stats
    await prisma.client.update({
      where: { id: client.id },
      data: {
        totalVisits: { increment: 1 }
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Public Booking SUBMIT Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
