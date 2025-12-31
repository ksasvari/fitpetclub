// app/api/pets/[id]/weights/[weightId]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------
   PUT  /api/pets/:id/weights/:weightId
   Updates a single weight entry.
   ------------------------------------------------- */
export async function PUT(
  request: Request,
  { params }: { params: { id: string; weightId: string } }
) {
  const petId = Number(params.id);
  const weightId = Number(params.weightId);

  if (isNaN(petId) || isNaN(weightId)) {
    return NextResponse.json(
      { error: 'Invalid petId or weightId' },
      { status: 400 }
    );
  }

  const body = await request.json();

  if (typeof body.weightKg !== 'number' || body.weightKg <= 0) {
    return NextResponse.json(
      { error: 'Invalid weightKg' },
      { status: 400 }
    );
  }

  // Update the weight entry (ensure it belongs to the correct pet)
  const updated = await prisma.weightLog.update({
    where: { id: weightId, petId },
    data: {
      weightKg: body.weightKg,
      measuredAt: body.measuredAt ? new Date(body.measuredAt) : undefined,
    },
  });

  return NextResponse.json(updated);
}

/* -------------------------------------------------
   DELETE /api/pets/:id/weights/:weightId
   Deletes a single weight entry.
   ------------------------------------------------- */
export async function DELETE(
  _: Request,
  { params }: { params: { weightId: string } }
) {
  const weightId = Number(params.weightId);
  if (isNaN(weightId)) {
    return NextResponse.json(
      { error: 'Invalid weightId' },
      { status: 400 }
    );
  }

  await prisma.weightLog.delete({ where: { id: weightId } });
  return NextResponse.json({ success: true });
}
