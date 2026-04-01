const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true, slug: true }
    })
    console.log("Existing Tenants:", JSON.stringify(tenants, null, 2))
  } catch (error) {
    console.error("Prisma Error:", error)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
