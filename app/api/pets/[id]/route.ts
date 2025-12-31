// app/api/pets/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------
   GET  /api/pets/:id
   Returns ONE pet INCLUDING its weight logs.
   ------------------------------------------------- */
export async function GET(
  _: Request,
  // In Next 16, params is a Promise, so we type it accordingly
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params promise to get the actual id string
  const { id } = await params;
  const petId = Number(id);

  if (isNaN(petId)) {
    return NextResponse.json(
      { error: 'Invalid pet id' },
      { status: 400 }
    );
  }

  // Pull the pet together with its weight entries (ordered by date)
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      // Pull the weight entries, ordered by measuredAt (oldest → newest)
      weights: { orderBy: { measuredAt: 'asc' } },
    },
  });

  if (!pet) {
    return NextResponse.json(
      { error: 'Pet not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(pet);
}
