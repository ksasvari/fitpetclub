process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pets = await prisma.pet.findMany();
  console.log('Pets in DB:', pets);
}

await main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
