// app/pet/[id]/weights/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* -------------------------------------------------
   GET  /pet/:id/weights
   Returns all weight logs for a given pet (sorted by date)
   ------------------------------------------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const petId = Number(id);

  if (isNaN(petId)) {
    return NextResponse.json(
      { error: "Invalid pet id" },
      { status: 400 }
    );
  }

  const weights = await prisma.weightLog.findMany({
    where: { petId },
    orderBy: { measuredAt: "asc" },
  });

  return NextResponse.json(weights);
}

/* -------------------------------------------------
   POST /pet/:id/weights
   Adds a new weight entry for the pet
   ------------------------------------------------- */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const petId = Number(id);

  if (isNaN(petId)) {
    return NextResponse.json(
      { error: "Invalid pet id" },
      { status: 400 }
    );
  }

  const body = await request.json();

  if (typeof body.weightKg !== "number" || body.weightKg <= 0) {
    return NextResponse.json(
      { error: "Invalid weightKg" },
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
   OPTIONAL: Reject unsupported methods on the collection
   ------------------------------------------------- */
export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed on collection endpoint" },
    { status: 405 }
  );
}
export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed on collection endpoint" },
    { status: 405 }
  );
}
