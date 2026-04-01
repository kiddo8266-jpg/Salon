import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    // 1. Ensure a default tenant exists
    let tenant = await prisma.tenant.findUnique({ where: { slug: 'wellness-center-elite' } })
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Wellness Center Elite',
          slug: 'wellness-center-elite',
          category: 'WELLNESS_CENTER',
          themeColor: '#7C3AED',
          tagline: 'Comprehensive Care & Recovery',
          planType: 'PROFESSIONAL',
        }
      })
    }

    const tenantId = tenant.id
    console.log('--- Starting Seeding via API for Tenant:', tenantId)

    // 1. Check if services already exist to avoid duplicates
    const existingServices = await prisma.service.findFirst({ where: { tenantId } })
    if (existingServices) {
      return NextResponse.json({ message: "Seed already exists for this tenant" })
    }

    // 2. Create Staff Users with Diverse Roles
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // We already have the current user, let's create more staff
    const staffData = [
      { name: 'Dr. Sarah Chen', email: `sarah.${tenantId}@wellness.com`, specialization: 'General Medicine/Clinical Director' },
      { name: 'Marcus Miller', email: `marcus.${tenantId}@wellness.com`, specialization: 'Elite Fitness Trainer' },
      { name: 'Elena Rodriguez', email: `elena.${tenantId}@wellness.com`, specialization: 'Senior Physiotherapist' },
      { name: 'Nurse Jasmine', email: `nurse.${tenantId}@wellness.com`, specialization: 'Registered Nurse' },
      { name: 'David Okafor', email: `david.${tenantId}@wellness.com`, specialization: 'Nutrition & Wellness Coach' },
      { name: 'Leila Kim', email: `leila.${tenantId}@wellness.com`, specialization: 'Master Massage Therapist' },
      { name: 'James Wilson', email: `james.${tenantId}@wellness.com`, specialization: 'Clinical Officer' },
    ]

    const staffMembers = []
    for (const s of staffData) {
      const user = await prisma.user.create({
        data: {
          tenantId,
          name: s.name,
          email: s.email,
          password: hashedPassword,
          role: 'STAFF',
        }
      })

      const staff = await prisma.staff.create({
        data: {
          tenantId,
          userId: user.id,
          specialization: s.specialization,
          bio: `Experienced specialist in ${s.specialization}.`,
          rating: 4.8 + Math.random() * 0.2,
        }
      })
      staffMembers.push(staff)
    }

    // 3. Create Rich Services (Clinic, Gym, Sauna, Massage)
    const serviceData = [
      // MEDICAL CLINIC
      { name: 'GP Consultation', category: 'Clinic', duration: 30, price: 50, color: '#f87171' },
      { name: 'Specialist Medical Review', category: 'Clinic', duration: 45, price: 120, color: '#ef4444' },
      { name: 'Nursing Health Assessment', category: 'Clinic', duration: 30, price: 35, color: '#ef4444' },
      { name: 'Doctor’s Recommendation Session', category: 'Clinic', duration: 20, price: 40, color: '#dc2626' },
      { name: 'Diagnostic Lab Test Review', category: 'Clinic', duration: 15, price: 25, color: '#ef4444' },
      
      // GYM & FITNESS
      { name: '1-on-1 Personal Training', category: 'Gym', duration: 60, price: 75, color: '#3b82f6' },
      { name: 'HIIT Performance Class', category: 'Gym', duration: 45, price: 25, color: '#60a5fa' },
      { name: 'Yoga Vinyasa Flow', category: 'Gym', duration: 75, price: 30, color: '#93c5fd' },
      { name: 'Nutrition Consultation', category: 'Gym', duration: 45, price: 65, color: '#2563eb' },
      
      // MASSAGE & THERAPY
      { name: 'Deep Tissue Massage', category: 'Massage', duration: 90, price: 120, color: '#10b981' },
      { name: 'Swedish Relaxation Massage', category: 'Massage', duration: 60, price: 90, color: '#34d399' },
      { name: 'Physiotherapy Session', category: 'Massage', duration: 45, price: 110, color: '#059669' },
      { name: 'Thai Yoga Stretching', category: 'Massage', duration: 90, price: 130, color: '#10b981' },

      // SAUNA & RECOVERY
      { name: 'Infrared Sauna Detox', category: 'Sauna', duration: 40, price: 45, color: '#f59e0b' },
      { name: 'Cryotherapy Recovery', category: 'Sauna', duration: 15, price: 80, color: '#fbbf24' },
      { name: 'Cold Plunge Experience', category: 'Sauna', duration: 20, price: 35, color: '#f59e0b' },
      { name: 'Finnish Steam Session', category: 'Sauna', duration: 45, price: 40, color: '#d97706' },
    ]

    const services = await Promise.all(
      serviceData.map((s) =>
        prisma.service.create({
          data: {
            tenantId,
            ...s,
          },
        })
      )
    )

    // 4. Create Clients (Patients/Members)
    const clientData = [
      { fullName: 'Eleanor Shellstrop', email: `eleanor.${tenantId}@example.com`, tags: ['VIP', 'Clinic'], loyaltyTier: 'Platinum', totalVisits: 22 },
      { fullName: 'Chidi Anagonye', email: `chidi.${tenantId}@example.com`, tags: ['Regular', 'Gym'], loyaltyTier: 'Gold', totalVisits: 15 },
      { fullName: 'Tahani Al-Jamil', email: `tahani.${tenantId}@example.com`, tags: ['Elite', 'Sauna'], loyaltyTier: 'Platinum', totalVisits: 45 },
      { fullName: 'Jason Mendoza', email: `jason.${tenantId}@example.com`, tags: ['New', 'Massage'], loyaltyTier: 'Bronze', totalVisits: 2 },
      { fullName: 'Janet Dell', email: `janet.${tenantId}@example.com`, tags: ['Regular', 'Clinic'], loyaltyTier: 'Silver', totalVisits: 8 },
      { fullName: 'Michael Arclight', email: `michael.${tenantId}@example.com`, tags: ['Regular', 'Gym'], loyaltyTier: 'Gold', totalVisits: 12 },
    ]

    const clientsList = await Promise.all(
      clientData.map((c) =>
        prisma.client.create({
          data: {
            tenantId,
            ...c,
          },
        })
      )
    )

    // 5. Create Appointments with Clinical Notes
    const today = new Date()
    today.setHours(9, 0, 0, 0)

    const appointments = [
      { cIdx: 0, sIdx: 0, servIdx: 0, offset: 1, notes: "Patient complaining of knee pain. RECOMMENDATION: Doctor suggests light stretching and 3 sessions of physiotherapy with Elena." },
      { cIdx: 1, sIdx: 1, servIdx: 5, offset: 2, notes: "Strength training session focus on core. Client progressing well." },
      { cIdx: 2, sIdx: 5, servIdx: 9, offset: 3, notes: "Focus on shoulder blade tension. Deep tissue work applied." },
      { cIdx: 4, sIdx: 6, servIdx: 1, offset: 4, notes: "Clinical review of post-op recovery. RECOMMENDATION: Clinical Officer recommends continued use of compression socks." },
      { cIdx: 5, sIdx: 3, servIdx: 2, offset: 0, notes: "Blood pressure check. All results within normal range. Nurse recommendation: maintain hydration." }
    ]

    for (const a of appointments) {
      const start = new Date(today)
      start.setHours(today.getHours() + a.offset)
      const end = new Date(start)
      end.setHours(start.getHours() + 1)

      await prisma.appointment.create({
        data: {
          tenantId,
          clientId: clientsList[a.cIdx].id,
          staffId: staffMembers[a.sIdx].id,
          serviceId: services[a.servIdx].id,
          startTime: start,
          endTime: end,
          notes: a.notes,
          status: 'CONFIRMED',
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Seeded rich data for your tenant successfully!",
      counts: {
        staff: staffMembers.length,
        services: services.length,
        clients: clientsList.length,
        appointments: appointments.length
      }
    })

  } catch (error: any) {
    console.error("Seed error details:", error)
    return NextResponse.json({ 
      error: "Seed failed", 
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
