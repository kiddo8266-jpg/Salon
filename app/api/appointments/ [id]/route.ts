import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addMinutes } from "date-fns"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = params
    const body = await req.json()
    const { startTime: startTimeStr, notes, status, staffId, serviceId } = body

    // Fetch existing appointment to get current values if not provided
    const existingAppt = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true }
    })

    if (!existingAppt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (existingAppt.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updateData: any = {}
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) updateData.status = status
    if (staffId !== undefined) updateData.staffId = staffId
    if (serviceId !== undefined) updateData.serviceId = serviceId

    if (startTimeStr || staffId || serviceId) {
      const startTime = startTimeStr ? new Date(startTimeStr) : existingAppt.startTime
      const currentServiceId = serviceId || existingAppt.serviceId
      const currentStaffId = staffId || existingAppt.staffId

      const service = serviceId 
        ? await prisma.service.findUnique({ where: { id: serviceId } })
        : existingAppt.service

      if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 })

      const endTime = addMinutes(startTime, service.duration)
      updateData.startTime = startTime
      updateData.endTime = endTime

      // Collision check (excluding current appointment)
      const collision = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          tenantId: session.user.tenantId,
          staffId: currentStaffId,
          status: { notIn: ['CANCELLED'] },
          OR: [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            { startTime: { gte: startTime }, endTime: { lte: endTime } }
          ]
        }
      })

      if (collision) {
        return NextResponse.json({ 
          error: "Staff member is already booked at this time", 
          code: "COLLISION" 
        }, { status: 409 })
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
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
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH Appointment Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = params

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (appointment.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Instead of hard-delete, we can cancel it or hard-delete if requested
    // For now, let's just delete to keep it simple for the user as requested
    await prisma.appointment.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Appointment deleted" })
  } catch (error) {
    console.error("DELETE Appointment Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
