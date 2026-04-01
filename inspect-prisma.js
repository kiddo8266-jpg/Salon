const { PrismaClient } = require("@prisma/client")
console.log("PrismaClient Prototype Keys:", Object.keys(PrismaClient.prototype))
console.log("PrismaClient instance keys (if any):", Object.keys(new PrismaClient({ adapter: {} })))
