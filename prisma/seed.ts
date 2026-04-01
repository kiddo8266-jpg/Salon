import { BusinessCategory, UserRole, AppointmentStatus, PaymentStatus, PaymentMethod, PlanType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('--- Starting Seeding Process ---')

  // 0. Create System Administrator (SUPER_ADMIN)
  const systemTenant = await prisma.tenant.upsert({
    where: { slug: 'wellnessos-system' },
    update: {},
    create: {
      name: 'WellnessOS System',
      slug: 'wellnessos-system',
      category: BusinessCategory.WELLNESS_CENTER,
      planType: PlanType.ENTERPRISE,
    },
  })

  const adminHashedPassword = await bcrypt.hash('EliteAdmin2026!', 10)
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: systemTenant.id, email: 'admin@wellnessos.com' } },
    update: { role: UserRole.SUPER_ADMIN },
    create: {
      tenantId: systemTenant.id,
      name: 'System Administrator',
      email: 'admin@wellnessos.com',
      password: adminHashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })
  console.log(`- Created Super Admin: admin@wellnessos.com`)

  // 1. Create a Premium Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'wellness-center-elite' },
    update: {},
    create: {
      name: 'Wellness Center Elite',
      slug: 'wellness-center-elite',
      category: BusinessCategory.WELLNESS_CENTER,
      themeColor: '#7C3AED',
      tagline: 'Comprehensive Care & Recovery',
      phone: '+1 (555) 000-1111',
      email: 'contact@wellnesselite.com',
      address: '123 Ethereal Way, Glass City',
      planType: PlanType.PROFESSIONAL,
      workingHours: {
        mon: { open: '08:00', close: '20:00', isOpen: true },
        tue: { open: '08:00', close: '20:00', isOpen: true },
        wed: { open: '08:00', close: '20:00', isOpen: true },
        thu: { open: '08:00', close: '20:00', isOpen: true },
        fri: { open: '08:00', close: '20:00', isOpen: true },
        sat: { open: '09:00', close: '18:00', isOpen: true },
        sun: { open: '10:00', close: '16:00', isOpen: true },
      }
    },
  })
  console.log(`- Created Tenant: ${tenant.name}`)

  // 2. Create Staff Users with Diverse Roles
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const staffData = [
    { name: 'Dr. Sarah Chen', role: UserRole.OWNER, specialization: 'General Medicine/Clinical Director' },
    { name: 'Marcus Miller', role: UserRole.STAFF, specialization: 'Elite Fitness Trainer' },
    { name: 'Elena Rodriguez', role: UserRole.STAFF, specialization: 'Senior Physiotherapist' },
    { name: 'Nurse Jasmine', role: UserRole.STAFF, specialization: 'Registered Nurse' },
    { name: 'David Okafor', role: UserRole.STAFF, specialization: 'Nutrition & Wellness Coach' },
    { name: 'Leila Kim', role: UserRole.STAFF, specialization: 'Master Massage Therapist' },
    { name: 'Dr. James Wilson', role: UserRole.STAFF, specialization: 'Clinical Officer' },
  ]

  const staff = await Promise.all(
    staffData.map(async (s) => {
      const user = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: `${s.name.toLowerCase().replace(' ', '.')}@wellnesselite.com` } },
        update: {},
        create: {
          tenantId: tenant.id,
          name: s.name,
          email: `${s.name.toLowerCase().replace(' ', '.')}@wellnesselite.com`,
          password: hashedPassword,
          role: s.role,
        },
      })

      const staffMember = await prisma.staff.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          tenantId: tenant.id,
          userId: user.id,
          specialization: s.specialization,
          bio: `Experienced specialist in ${s.specialization} with over 10 years of experience.`,
          rating: 4.8 + Math.random() * 0.2,
        },
      })

      return { user, staffMember }
    })
  )
  console.log(`- Created ${staff.length} Staff members with diverse roles`)

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
      prisma.service.upsert({
        where: { id: `service-${s.name.toLowerCase().replace(/ /g, '-')}` },
        update: {},
        create: {
          id: `service-${s.name.toLowerCase().replace(/ /g, '-')}`,
          tenantId: tenant.id,
          ...s,
        },
      })
    )
  )
  console.log(`- Created ${services.length} Rich Services`)

  // 4. Create Clients (Patients/Members)
  const clientData = [
    { fullName: 'Eleanor Shellstrop', email: 'eleanor@example.com', tags: ['VIP', 'Clinic'], loyaltyTier: 'Platinum', totalVisits: 22 },
    { fullName: 'Chidi Anagonye', email: 'chidi@example.com', tags: ['Regular', 'Gym'], loyaltyTier: 'Gold', totalVisits: 15 },
    { fullName: 'Tahani Al-Jamil', email: 'tahani@example.com', tags: ['Elite', 'Sauna'], loyaltyTier: 'Platinum', totalVisits: 45 },
    { fullName: 'Jason Mendoza', email: 'jason@example.com', tags: ['New', 'Massage'], loyaltyTier: 'Bronze', totalVisits: 2 },
    { fullName: 'Janet Dell', email: 'janet@example.com', tags: ['Regular', 'Clinic'], loyaltyTier: 'Silver', totalVisits: 8 },
    { fullName: 'Michael Arclight', email: 'michael@example.com', tags: ['Regular', 'Gym'], loyaltyTier: 'Gold', totalVisits: 12 },
  ]

  const clients = await Promise.all(
    clientData.map((c) =>
      prisma.client.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: c.email } },
        update: {},
        create: {
          tenantId: tenant.id,
          ...c,
        },
      })
    )
  )
  console.log(`- Created ${clients.length} Clients`)

  // 5. Create Appointments with Clinical Notes
  const today = new Date()
  today.setHours(9, 0, 0, 0)

  const appointmentData = [
    {
      clientIdx: 0, 
      staffIdx: 0, // Dr Sarah
      serviceIdx: 0, // GP Consultation
      startOffset: 1, // 1 hour from 9am
      notes: "Patient complaining of knee pain after morning run. RECOMMENDATION: Doctor suggests light stretching and 3 sessions of physiotherapy with Elena. Professional medical review in 2 weeks."
    },
    {
      clientIdx: 1, 
      staffIdx: 1, // Marcus
      serviceIdx: 5, // Personal Training
      startOffset: 2, 
      notes: "Strength training session focus on core. Client progressing well."
    },
    {
      clientIdx: 2, 
      staffIdx: 5, // Leila
      serviceIdx: 9, // Deep Tissue
      startOffset: 3, 
      notes: "Focus on shoulder blade tension. Client highly recommended the aromatherapy oil."
    },
    {
        clientIdx: 4, 
        staffIdx: 6, // Dr James Wilson
        serviceIdx: 1, // Medical Review
        startOffset: 4, 
        notes: "Clinical review of post-op recovery. RECOMMENDATION: Clinical Officer recommends continued use of compression socks and gentle daily walking. Next review in 5 days."
    },
    {
        clientIdx: 5, 
        staffIdx: 3, // Nurse Jasmine
        serviceIdx: 2, // Nurse Health Assessment
        startOffset: 0, 
        notes: "Blood pressure and vitals check. All results within normal range. Nurse recommendation: maintain current hydration levels."
    }
  ]

  await Promise.all(
    appointmentData.map((a) => {
      const startTime = new Date(today)
      startTime.setHours(today.getHours() + a.startOffset)
      const endTime = new Date(startTime)
      endTime.setHours(startTime.getHours() + 1)

      return prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          clientId: clients[a.clientIdx].id,
          staffId: staff[a.staffIdx].staffMember.id,
          serviceId: services[a.serviceIdx].id,
          startTime,
          endTime,
          notes: a.notes,
          status: AppointmentStatus.CONFIRMED,
        },
      })
    })
  )
  console.log(`- Created 5 Sample Appointments with clinical notes and recommendations`)

  console.log('--- Seeding Completed Successfully ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
