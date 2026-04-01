const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);

async function main() {
  const prisma = new PrismaClient();
  console.log('--- Starting Seeding Process (JS) ---');

  // 1. Create a Premium Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'wellness-center-elite' },
    update: {},
    create: {
      name: 'Wellness Center Elite',
      slug: 'wellness-center-elite',
      category: 'WELLNESS_CENTER',
      themeColor: '#7C3AED',
      tagline: 'Comprehensive Care & Recovery',
      phone: '+1 (555) 000-1111',
      email: 'contact@wellnesselite.com',
      address: '123 Ethereal Way, Glass City',
      planType: 'PROFESSIONAL',
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
  });
  console.log(`- Created Tenant: ${tenant.name}`);

  // 2. Create Staff Users with Diverse Roles
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const staffData = [
    { name: 'Dr. Sarah Chen', role: 'OWNER', email: 'dr.sarah.chen@wellnesselite.com', specialization: 'General Medicine/Clinical Director' },
    { name: 'Marcus Miller', role: 'STAFF', email: 'marcus.miller@wellnesselite.com', specialization: 'Elite Fitness Trainer' },
    { name: 'Elena Rodriguez', role: 'STAFF', email: 'elena.rodriguez@wellnesselite.com', specialization: 'Senior Physiotherapist' },
    { name: 'Nurse Jasmine', role: 'STAFF', email: 'nurse.jasmine@wellnesselite.com', specialization: 'Registered Nurse' },
    { name: 'David Okafor', role: 'STAFF', email: 'david.okafor@wellnesselite.com', specialization: 'Nutrition & Wellness Coach' },
    { name: 'Leila Kim', role: 'STAFF', email: 'leila.kim@wellnesselite.com', specialization: 'Master Massage Therapist' },
    { name: 'Dr. James Wilson', role: 'STAFF', email: 'dr.james.wilson@wellnesselite.com', specialization: 'Clinical Officer' },
  ];

  const staff = [];
  for (const s of staffData) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: s.email } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: s.role,
      },
    });

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
    });
    staff.push({ user, staffMember });
  }
  console.log(`- Created ${staff.length} Staff members with diverse roles`);

  // 3. Create Rich Services (Clinic, Gym, Sauna, Massage)
  const serviceData = [
    { name: 'GP Consultation', category: 'Clinic', duration: 30, price: 50, color: '#f87171' },
    { name: 'Specialist Medical Review', category: 'Clinic', duration: 45, price: 120, color: '#ef4444' },
    { name: 'Nursing Health Assessment', category: 'Clinic', duration: 30, price: 35, color: '#ef4444' },
    { name: 'Doctor’s Recommendation Session', category: 'Clinic', duration: 20, price: 40, color: '#dc2626' },
    { name: 'Diagnostic Lab Test Review', category: 'Clinic', duration: 15, price: 25, color: '#ef4444' },
    { name: '1-on-1 Personal Training', category: 'Gym', duration: 60, price: 75, color: '#3b82f6' },
    { name: 'HIIT Performance Class', category: 'Gym', duration: 45, price: 25, color: '#60a5fa' },
    { name: 'Yoga Vinyasa Flow', category: 'Gym', duration: 75, price: 30, color: '#93c5fd' },
    { name: 'Nutrition Consultation', category: 'Gym', duration: 45, price: 65, color: '#2563eb' },
    { name: 'Deep Tissue Massage', category: 'Massage', duration: 90, price: 120, color: '#10b981' },
    { name: 'Swedish Relaxation Massage', category: 'Massage', duration: 60, price: 90, color: '#34d399' },
    { name: 'Physiotherapy Session', category: 'Massage', duration: 45, price: 110, color: '#059669' },
    { name: 'Thai Yoga Stretching', category: 'Massage', duration: 90, price: 130, color: '#10b981' },
    { name: 'Infrared Sauna Detox', category: 'Sauna', duration: 40, price: 45, color: '#f59e0b' },
    { name: 'Cryotherapy Recovery', category: 'Sauna', duration: 15, price: 80, color: '#fbbf24' },
    { name: 'Cold Plunge Experience', category: 'Sauna', duration: 20, price: 35, color: '#f59e0b' },
    { name: 'Finnish Steam Session', category: 'Sauna', duration: 45, price: 40, color: '#d97706' },
  ];

  const services = [];
  for (const s of serviceData) {
    const service = await prisma.service.create({
      data: {
        tenantId: tenant.id,
        ...s,
      },
    });
    services.push(service);
  }
  console.log(`- Created ${services.length} Rich Services`);

  // 4. Create Clients (Patients/Members)
  const clientData = [
    { fullName: 'Eleanor Shellstrop', email: 'eleanor@example.com', tags: ['VIP', 'Clinic'], loyaltyTier: 'Platinum', totalVisits: 22 },
    { fullName: 'Chidi Anagonye', email: 'chidi@example.com', tags: ['Regular', 'Gym'], loyaltyTier: 'Gold', totalVisits: 15 },
    { fullName: 'Tahani Al-Jamil', email: 'tahani@example.com', tags: ['Elite', 'Sauna'], loyaltyTier: 'Platinum', totalVisits: 45 },
    { fullName: 'Jason Mendoza', email: 'jason@example.com', tags: ['New', 'Massage'], loyaltyTier: 'Bronze', totalVisits: 2 },
    { fullName: 'Janet Dell', email: 'janet@example.com', tags: ['Regular', 'Clinic'], loyaltyTier: 'Silver', totalVisits: 8 },
    { fullName: 'Michael Arclight', email: 'michael@example.com', tags: ['Regular', 'Gym'], loyaltyTier: 'Gold', totalVisits: 12 },
  ];

  const clients = [];
  for (const c of clientData) {
    const client = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        ...c,
      },
    });
    clients.push(client);
  }
  console.log(`- Created ${clients.length} Clients`);

  // 5. Create Appointments
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const appointmentData = [
    { clientIdx: 0, staffIdx: 0, serviceIdx: 0, offset: 1, notes: "Knee pain review." },
    { clientIdx: 1, staffIdx: 1, serviceIdx: 5, offset: 2, notes: "Core workout." },
    { clientIdx: 2, staffIdx: 5, serviceIdx: 9, offset: 3, notes: "Shoulder tension." },
    { clientIdx: 4, staffIdx: 6, serviceIdx: 1, offset: 4, notes: "Medical review." },
    { clientIdx: 5, staffIdx: 3, serviceIdx: 2, offset: 0, notes: "Vitals check." },
  ];

  for (const a of appointmentData) {
    const start = new Date(today);
    start.setHours(today.getHours() + a.offset);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        clientId: clients[a.clientIdx].id,
        staffId: staff[a.staffIdx].staffMember.id,
        serviceId: services[a.serviceIdx].id,
        startTime: start,
        endTime: end,
        notes: a.notes,
        status: 'CONFIRMED',
      },
    });
  }
  console.log(`- Created 5 Sample Appointments`);

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
