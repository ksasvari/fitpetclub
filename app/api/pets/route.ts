// app/api/pets/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* -------------------------------------------------
   GET /api/pets
   Returns all pets belonging to the authenticated user
   ------------------------------------------------- */
export async function GET(request: NextRequest) {
  // The middleware puts the user id in the header "x-user-id"
  const userIdHeader = request.headers.get("x-user-id");
  const userId = userIdHeader ? Number(userIdHeader) : null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthenticated" },
      { status: 401 }
    );
  }

  const pets = await prisma.pet.findMany({
    where: { userId },
    include: { weights: { orderBy: { measuredAt: "asc" } } },
  });
  return NextResponse.json(pets);
}

/* -------------------------------------------------
   POST /api/pets
   Creates a new pet for the authenticated user
   ------------------------------------------------- */
export async function POST(request: NextRequest) {
  // Get the user id from the header injected by middleware
  const userIdHeader = request.headers.get("x-user-id");
  const userId = userIdHeader ? Number(userIdHeader) : null;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthenticated" },
      { status: 401 }
    );
  }

  const body = await request.json();

  // Basic validation (you can expand this as needed)
  if (!body.name || !body.species) {
    return NextResponse.json(
      { error: "Missing required fields (name, species)" },
      { status: 400 }
    );
  }

  const newPet = await prisma.pet.create({
    data: {
      // Associate the pet with the logged‑in user
      user: { connect: { id: userId } },

      // Fields from the request body
      name: body.name,
      species: body.species,
      breed: body.breed ?? null,
      age: body.age ?? null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      deathDate: body.deathDate ? new Date(body.deathDate) : null,
      gender: body.gender ?? "UNKNOWN",
      neutered: body.neutered ?? false,
      description: body.description ?? null,
    },
  });

  return NextResponse.json(newPet, { status: 201 });
}

/* -------------------------------------------------
   (Optional) Add a placeholder for unsupported methods
   ------------------------------------------------- */
export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed on /api/pets" },
    { status: 405 }
  );
}
export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed on /api/pets" },
    { status: 405 }
  );
}
