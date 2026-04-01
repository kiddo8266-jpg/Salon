const { PrismaClient } = require("@prisma/client")
require("dotenv").config({ path: ".env.local" })

try {
  console.log("Testing Prisma initialization...")
  const prisma = new PrismaClient()
  console.log("Success! Prisma initialized without options.")
} catch (error) {
  console.error("Initialization Failed:", error.message)
}
