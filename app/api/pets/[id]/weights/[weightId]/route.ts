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
  // In Next 16, params is a Promise, so we type it accordingly
  { params }: { params: Promise<{ id: string; weightId: string }> }
) {
  // ----- Await the params promise -----
  const { id, weightId } = await params;
  const petId = Number(id);
  const wId = Number(weightId);

  if (isNaN(petId) || isNaN(wId)) {
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

  // Update the weight entry – ensure it belongs to the correct pet
  const updated = await prisma.weightLog.update({
    where: { id: wId, petId }, // composite filter (if your schema supports it)
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
  // params is a Promise here as well
  { params }: { params: Promise<{ weightId: string }> }
) {
  const { weightId } = await params;
  const wId = Number(weightId);

  if (isNaN(wId)) {
    return NextResponse.json(
      { error: 'Invalid weightId' },
      { status: 400 }
    );
  }

  await prisma.weightLog.delete({ where: { id: wId } });
  return NextResponse.json({ success: true });
}

/* -------------------------------------------------
   Optional: reject GET on this nested route (method not allowed)
   ------------------------------------------------- */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
