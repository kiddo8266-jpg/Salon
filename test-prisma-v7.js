const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const { Pool } = require("pg")
require("dotenv").config({ path: ".env.local" })

async function testV7() {
  console.log("Testing Prisma 7 Driver Adapter...")
  
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  try {
    const prisma = new PrismaClient({ adapter })
    console.log("Prisma Client created successfully.")
    
    await prisma.$connect()
    console.log("Connected to database via Driver Adapter.")
    
    const count = await prisma.user.count()
    console.log(`Successfully queried database! User count: ${count}`)
    
    await prisma.$disconnect()
    console.log("Disconnected successfully.")
  } catch (error) {
    console.error("V7 Test Failed:", error)
  } finally {
    pool.end()
  }
}

testV7()
