// scripts/assign-pets.js
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();

  const adminId = 1; // <-- replace with the actual id printed earlier

  const result = await prisma.pet.updateMany({
    data: { userId: adminId },
  });

  console.log('✅ Updated pets count:', result.count);
  await prisma.$disconnect();
})();
