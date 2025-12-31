// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();

  // Create the admin user (change the email if you like)
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      plan: 'free',          // or 'premium' if you prefer
    },
  });

  console.log('✅ Created user:', user);

  await prisma.$disconnect();
})();
