import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.pet.create({
    data: {
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 4,
      description: 'Friendly family dog',
    },
  });
  console.log('✅ Seeded one pet');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
