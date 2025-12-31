// app/api/pets/[id]/weights/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------
   GET  /api/pets/:id/weights
   Returns all weight entries for the given pet,
   ordered by measuredAt (oldest → newest).
   ------------------------------------------------- */
export async function GET(
  _: Request,
  // NOTE: params is a Promise in Next 16, so we await it
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;          // <-- await the promise
  const petId = Number(id);
  if (isNaN(petId)) {
    return NextResponse.json(
      { error: 'Invalid pet id' },
      { status: 400 }
    );
  }

  const weights = await prisma.weightLog.findMany({
    where: { petId },
    orderBy: { measuredAt: 'asc' },
  });

  return NextResponse.json(weights);
}

/* -------------------------------------------------
   POST /api/pets/:id/weights
   Expected body: { weightKg: number, measuredAt?: string (ISO) }
   ------------------------------------------------- */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;          // <-- await the promise
  const petId = Number(id);
  const body = await request.json();

  if (typeof body.weightKg !== 'number' || body.weightKg <= 0) {
    return NextResponse.json(
      { error: 'Invalid weightKg' },
      { status: 400 }
    );
  }

  const newWeight = await prisma.weightLog.create({
    data: {
      petId,
      weightKg: body.weightKg,
      measuredAt: body.measuredAt ? new Date(body.measuredAt) : undefined,
    },
  });

  return NextResponse.json(newWeight, { status: 201 });
}

/* -------------------------------------------------
   PUT  /api/pets/:id/weights/:weightId
   Expected body: { weightKg: number, measuredAt?: string }
   ------------------------------------------------- */
export async function PUT(
  request: Request,
  {
    params,
  }: { params: Promise<{ id: string; weightId: string }> }
) {
  const { id, weightId } = await params; // <-- await the promise
  const petId = Number(id);              // (petId is not used here but kept for symmetry)
  const wId = Number(weightId);
  const body = await request.json();

  if (typeof body.weightKg !== 'number' || body.weightKg <= 0) {
    return NextResponse.json(
      { error: 'Invalid weightKg' },
      { status: 400 }
    );
  }

  const updated = await prisma.weightLog.update({
    where: { id: wId },
    data: {
      weightKg: body.weightKg,
      measuredAt: body.measuredAt ? new Date(body.measuredAt) : undefined,
    },
  });

  return NextResponse.json(updated);
}

/* -------------------------------------------------
   DELETE /api/pets/:id/weights/:weightId
   ------------------------------------------------- */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ weightId: string }> }
) {
  const { weightId } = await params; // <-- await the promise
  const wId = Number(weightId);
  await prisma.weightLog.delete({ where: { id: wId } });
  return NextResponse.json({ success: true });
}
