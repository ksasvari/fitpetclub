// app/api/pets/[id]/weights/[weightId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* -------------------------------------------------
   PUT  /api/pets/:id/weights/:weightId
   Updates a single weight entry (must belong to the pet)
   ------------------------------------------------- */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; weightId: string }> }
) {
  const { id, weightId } = await params;
  const petId = Number(id);
  const wId = Number(weightId);

  if (isNaN(petId) || isNaN(wId)) {
    return NextResponse.json(
      { error: "Invalid petId or weightId" },
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

  // Update only if the weight belongs to the specified pet
  const updated = await prisma.weightLog.update({
    where: { id: wId, petId },
    data: {
      weightKg: body.weightKg,
      measuredAt: body.measuredAt ? new Date(body.measuredAt) : undefined,
    },
  });

  return NextResponse.json(updated);
}

/* -------------------------------------------------
   DELETE /api/pets/:id/weights/:weightId
   Removes a single weight entry (must belong to the pet)
   ------------------------------------------------- */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; weightId: string }> }
) {
  const { weightId } = await params;
  const wId = Number(weightId);

  if (isNaN(wId)) {
    return NextResponse.json(
      { error: "Invalid weightId" },
      { status: 400 }
    );
  }

  await prisma.weightLog.delete({ where: { id: wId } });
  return NextResponse.json({ success: true });
}

/* -------------------------------------------------
   (Optional) Reject unsupported methods on the item route
   ------------------------------------------------- */
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed on single-item endpoint" },
    { status: 405 }
  );
}
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed on single-item endpoint" },
    { status: 405 }
  );
}
