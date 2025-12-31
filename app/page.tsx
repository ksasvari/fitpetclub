// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/* ------------------------------
   Types
   ------------------------------ */
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
};

/* ------------------------------
   Main component
   ------------------------------ */
export default function HomePage() {
  /* ---------- PET LIST STATE ---------- */
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPets(data);
    } catch (e: any) {
      setListError(e.message);
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  /* ---------- FORM STATE ---------- */
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    birthDate: null as Date | null,
    deathDate: null as Date | null,
    weightCurrent: '',
    weightPrev: '',
    gender: 'UNKNOWN' as 'MALE' | 'FEMALE' | 'UNKNOWN',
    neutered: false,
    description: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    // Basic validation
    if (!form.name.trim() || !form.species.trim()) {
      setFormError('Name and species are required.');
      setSubmitting(false);
      return;
    }

    // Build payload for the API
    const payload: Record<string, any> = {
      name: form.name,
      species: form.species,
      breed: form.breed || null,
      gender: form.gender,
      neutered: form.neutered,
      description: form.description || null,
    };

    // Birth / death dates
    if (form.birthDate) {
      payload.birthDate = form.birthDate.toISOString().split('T')[0];
    } else if (form.age) {
      payload.age = Number(form.age);
    }

    if (form.deathDate) {
      payload.deathDate = form.deathDate.toISOString().split('T')[0];
    }

    // Optional weight fields (you can keep them or remove them later)
    if (form.weightCurrent) payload.weightCurrent = Number(form.weightCurrent);
    if (form.weightPrev) payload.weightPrev = Number(form.weightPrev);

    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Clear form & refresh list
      setForm({
        name: '',
        species: '',
        breed: '',
        age: '',
        birthDate: null,
        deathDate: null,
        weightCurrent: '',
        weightPrev: '',
        gender: 'UNKNOWN',
        neutered: false,
        description: '',
      });
      await fetchPets();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------
     Render
     ------------------------------ */
  return (
    <main style={{ padding: '2rem' }}>
      <h1>🐾 Pet Log</h1>

      {/* ---------- PET LIST ---------- */}
      <section style={{ marginTop: '2rem' }}>
        <h2>All Pets</h2>

        {loadingPets ? (
          <p>Loading pets…</p>
        ) : listError ? (
          <p style={{ color: 'red' }}>Error loading pets: {listError}</p>
        ) : pets.length === 0 ? (
          <p>No pets found. Add some!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd' }}>ID</th>
                <th style={{ borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ borderBottom: '1px solid #ddd' }}>Species</th>
                <th style={{ borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id}>
                  <td style={{ padding: '4px' }}>{pet.id}</td>
                  <td style={{ padding: '4px' }}>
                    <strong>{pet.name}</strong>
                  </td>
                  <td style={{ padding: '4px' }}>{pet.species}</td>
                  <td style={{ padding: '4px' }}>
                    <a
                      href={`/pet/${pet.id}`}
                      style={{
                        color: '#0066cc',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ---------- ADD NEW PET FORM ---------- */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Add a New Pet</h2>

        {formError && <p style={{ color: 'red' }}>{formError}</p>}

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* ----- Name ----- */}
          <div>
            <label>
              Name (required):
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="off"
                spellCheck={false}
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>

          {/* ----- Species ----- */}
          <div>
            <label>
              Species (required):
              <input
                type="text"
                name="species"
                value={form.species}
                onChange={handleChange}
                required
                autoComplete="off"
                spellCheck={false}
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>

          {/* ----- Breed (optional) ----- */}
          <div>
            <label>
              Breed:
              <input
                type="text"
                name="breed"
                value={form.breed}
                onChange={handleChange}
                autoComplete="off"
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>

          {/* ----- Age (optional) ----- */}
          <div>
            <label>
              Age (years):
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="0"
                style={{ marginLeft: '0.5rem', width: '60px' }}
              />
            </label>
          </div>

          {/* ----- Birth Date (optional) ----- */}
          <div>
            <label>
              Birth date:
              <DatePicker
                selected={form.birthDate}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, birthDate: date }))
                }
                dateFormat="yyyy-MM-dd"
                isClearable
                placeholderText="Select a date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>

          {/* ----- Death Date (optional) ----- */}
          <div>
            <label>
              Death date:
              <DatePicker
                selected={form.deathDate}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, deathDate: date }))
                }
                dateFormat="yyyy-MM-dd"
                isClearable
                placeholderText="Select a date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>

          {/* ----- Current Weight (optional) ----- */}
          <div>
            <label>
              Current weight (kg):
              <input
                type="number"
                step="0.01"
                name="weightCurrent"
                value={form.weightCurrent}
                onChange={handleChange}
                min="0"
                style={{ marginLeft: '0.5rem', width: '80px' }}
              />
            </label>
          </div>

          {/* ----- Previous Weight (optional) ----- */}
          <div>
            <label>
              Previous weight (kg):
              <input
                type="number"
                step="0.01"
                name="weightPrev"
                value={form.weightPrev}
                onChange={handleChange}
                min="0"
                style={{ marginLeft: '0.5rem', width: '80px' }}
              />
            </label>
          </div>

          {/* ----- Gender ----- */}
          <div>
            <label>
              Gender:
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{ marginLeft: '0.5rem' }}
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>
          </div>

          {/* ----- Neutered ----- */}
          <div>
            <label>
              <input
                type="checkbox"
                name="neutered"
                checked={form.neutered}
                onChange={handleChange}
              />
              {' '}Neutered / Spayed
            </label>
          </div>

          {/* ----- Description (optional) ----- */}
          <div>
            <label>
              Description:
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                autoComplete="off"
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>

          {/* ----- Submit button ----- */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '1rem',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Saving…' : 'Add Pet'}
          </button>
        </form>
      </section>
    </main>
  );
}
