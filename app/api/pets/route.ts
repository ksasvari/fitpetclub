import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const pets = await prisma.pet.findMany();
  return NextResponse.json(pets);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim() || !body.species?.trim()) {
      return NextResponse.json(
        { error: 'Name and species are required.' },
        { status: 400 }
      );
    }

    let calculatedAge: number | null = null;
    if (body.birthDate) {
      const birth = new Date(body.birthDate);
      if (isNaN(birth.getTime())) {
        return NextResponse.json(
          { error: 'Invalid birthDate format.' },
          { status: 400 }
        );
      }
      const now = new Date();
      calculatedAge = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      const dayDiff = now.getDate() - birth.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        calculatedAge--;
      }
    }

    const ageToStore =
      calculatedAge !== null ? calculatedAge : body.age ?? null;

    const newPet = await prisma.pet.create({
      data: {
        name: body.name,
        species: body.species,
        breed: body.breed ?? null,
        age: ageToStore,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        gender: body.gender ?? 'UNKNOWN',
        neutered: !!body.neutered, // coerce to boolean
        description: body.description ?? null,
      },
    });

    return NextResponse.json(newPet, { status: 201 });
  } catch (err) {
    console.error('POST /api/pets error:', err);
    return NextResponse.json(
      { error: 'Failed to create pet.' },
      { status: 500 }
    );
  }
}
