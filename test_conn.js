const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Testing connection...');
prisma.$connect()
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Connection failed:');
    console.error(e);
    process.exit(1);
  });
