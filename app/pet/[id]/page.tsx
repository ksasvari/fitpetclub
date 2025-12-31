// app/pet/[id]/page.tsx
// 👉 This file is a **server component** (no 'use client' at the top)

import WeightChart from './WeightChart';
import ClientWeightTable from './ClientWeightTable';

/* -------------------------------------------------
   Types must match your Prisma schema
   ------------------------------------------------- */
export type Weight = {
  id: number;
  weightKg: number;
  measuredAt: string; // ISO timestamp
};

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  birthDate?: string | null;
  deathDate?: string | null;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  neutered: boolean;
  description?: string | null;
  createdAt: string;
  weights: Weight[];
};

/* -------------------------------------------------
   Helper: build an absolute URL for internal API calls.
   ------------------------------------------------- */
function getBaseUrl(): string {
  // In development we fall back to localhost.
  // In production you can set NEXT_PUBLIC_BASE_URL in .env
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
}

/* -------------------------------------------------
   Server‑side component – async so we can await params.
   ------------------------------------------------- */
export default async function PetDetail({
  params,
}: {
  // In Next 16 the params object is a Promise
  params: Promise<{ id: string }>;
}) {
  // ----- Resolve the dynamic segment -----
  const { id } = await params;
  const petId = Number(id);

  // ----- Fetch pet + weight logs (single request) -----
  const res = await fetch(`${getBaseUrl()}/api/pets/${petId}`);

  if (!res.ok) {
    return (
      <main style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>
          Error loading pet (status {res.status})
        </p>
        <a
          href="/"
          style={{
            marginTop: '1rem',
            display: 'inline-block',
            background: '#555',
            color: '#fff',
            padding: '6px 12px',
            textDecoration: 'none',
          }}
        >
          ← Back to list
        </a>
      </main>
    );
  }

  const pet: Pet = await res.json();

  // ----- Render UI -------------------------------------------------
  return (
    <main style={{ padding: '2rem' }}>
      {/* ---------- Header ---------- */}
      <h1>
        {pet.name} – {pet.species}
      </h1>

      {/* ---------- Optional basic info ---------- */}
      <ul style={{ marginTop: '1rem' }}>
        {pet.breed && <li>Breed: {pet.breed}</li>}
        {pet.age && <li>Age: {pet.age}</li>}
        {pet.birthDate && (
          <li>Born: {new Date(pet.birthDate).toLocaleDateString()}</li>
        )}
        {pet.deathDate && (
          <li>Died: {new Date(pet.deathDate).toLocaleDateString()}</li>
        )}
        <li>Gender: {pet.gender}</li>
        <li>Neutered: {pet.neutered ? 'Yes' : 'No'}</li>
        {pet.description && <li>Description: {pet.description}</li>}
      </ul>

      {/* ---------- Interactive Weight Table (client component) ---------- */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Weight History</h2>
        {pet.weights.length === 0 ? (
          <p>No weight records yet.</p>
        ) : (
          <ClientWeightTable initialWeights={pet.weights} petId={petId} />
        )}
      </section>

      {/* ---------- Recharts Line Chart (client component) ---------- */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Weight Over Time</h2>
        <WeightChart weights={pet.weights} />
      </section>

      {/* ---------- Back link ---------- */}
      <a
        href="/"
        style={{
          marginTop: '2rem',
          display: 'inline-block',
          background: '#555',
          color: '#fff',
          padding: '6px 12px',
          textDecoration: 'none',
        }}
      >
        ← Back to list
      </a>
    </main>
  );
}
