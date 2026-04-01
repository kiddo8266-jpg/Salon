import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addMinutes } from "date-fns"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const appointments = await prisma.appointment.findMany({
      where: { 
        tenantId: session.user.tenantId,
      },
      include: {
        client: true,
        service: true,
        staff: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
      },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("GET Appointments Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { clientId, serviceId, staffId, startTime: startTimeStr, notes } = body

    if (!clientId || !serviceId || !staffId || !startTimeStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const startTime = new Date(startTimeStr)
    
    // Fetch service duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const endTime = addMinutes(startTime, service.duration)

    // Check for staff availability (collision detection)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        tenantId: session.user.tenantId,
        staffId: staffId,
        status: { notIn: ['CANCELLED'] },
        OR: [
          {
            // New appointment starts during an existing one
            startTime: { lte: startTime },
            endTime: { gt: startTime }
          },
          {
            // New appointment ends during an existing one
            startTime: { lt: endTime },
            endTime: { gte: endTime }
          },
          {
            // New appointment completely wraps around an existing one
            startTime: { gte: startTime },
            endTime: { lte: endTime }
          }
        ]
      }
    })

    if (existingAppointment) {
      return NextResponse.json({ 
        error: "Staff member is already booked at this time", 
        code: "COLLISION" 
      }, { status: 409 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        tenantId: session.user.tenantId,
        clientId,
        serviceId,
        staffId,
        startTime,
        endTime,
        notes,
        status: 'CONFIRMED'
      },
      include: {
        client: true,
        service: true,
        staff: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("POST Appointment Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
