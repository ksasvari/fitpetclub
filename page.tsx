// app/pet/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Pet = {
  id: number;
  name: string;
  species: string;
  // add any other fields you need later (breed, age, etc.)
};

export default function PetDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const petId = Number(params.id);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPet() {
      try {
        const res = await fetch(`/api/pets/${petId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPet(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [petId]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!pet) return <p>Pet not found.</p>;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{pet.name} – {pet.species}</h1>

      {/* Placeholder for future UI (weight table, chart, etc.) */}
      <p>More pet details will go here.</p>

      <button
        onClick={() => router.back()}
        style={{
          marginTop: '2rem',
          background: '#555',
          color: '#fff',
          border: 'none',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        ← Back to list
      </button>
    </main>
  );
}
