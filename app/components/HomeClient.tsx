"use client"; // <--- MUST BE THE FIRST LINE, no blank lines before it

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/* -------------------------------------------------
   Force dynamic rendering (skip static pre‑render)
   ------------------------------------------------- */
export const dynamic = "force-dynamic";

/* -------------------------------------------------
   Types (adjust if you have a separate types file)
   ------------------------------------------------- */
type PetForm = {
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  birthDate?: string | null;
  gender: "MALE" | "FEMALE" | "UNKNOWN";
  neutered: boolean;
  description?: string | null;
};

type Pet = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  birthDate?: string | null;
  deathDate?: string | null;
  gender: "MALE" | "FEMALE" | "UNKNOWN";
  neutered: boolean;
  description?: string | null;
  createdAt: string;
  weights: any[];
};

/* -------------------------------------------------
   Main UI – Home / Pet list + Add‑Pet form
   ------------------------------------------------- */
export default function HomeClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // -----------------------------------------------------------------
  // Redirect unauthenticated users to /login
  // -----------------------------------------------------------------
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // -----------------------------------------------------------------
  // State for the list of pets
  // -----------------------------------------------------------------
  const [pets, setPets] = useState<Pet[]>([]);

  // -----------------------------------------------------------------
  // Load pets for the logged‑in user
  // -----------------------------------------------------------------
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pets")
        .then((r) => r.json())
        .then(setPets)
        .catch(console.error);
    }
  }, [status]);

  // -----------------------------------------------------------------
  // Form state for adding a new pet
  // -----------------------------------------------------------------
  const [form, setForm] = useState<PetForm>({
    name: "",
    species: "",
    breed: "",
    age: undefined,
    birthDate: "",
    gender: "UNKNOWN",
    neutered: false,
    description: "",
  });

  // -----------------------------------------------------------------
  // Fixed change handler – works for input, select, textarea
  // -----------------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const fieldValue = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : value;
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  // -----------------------------------------------------------------
  // Submit new pet to the API
  // -----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.species.trim()) {
      alert("Please provide at least a name and species.");
      return;
    }

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const newPet = await res.json();
      setPets((prev) => [...prev, newPet]);

      // Reset the form
      setForm({
        name: "",
        species: "",
        breed: "",
        age: undefined,
        birthDate: "",
        gender: "UNKNOWN",
        neutered: false,
        description: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create pet – see console for details.");
    }
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  if (status === "loading") return <p>Loading…</p>;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>🐾 FitPetClub – Your Pets</h1>

      {/* Sign‑out button */}
      <button onClick={() => signOut()} style={{ marginBottom: "1rem" }}>
        Sign out
      </button>

      {/* ------------------- Pet list ------------------- */}
      <section>
        <h2>Your Pets</h2>
        {pets.length === 0 ? (
          <p>No pets yet – add one below!</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd" }}>Name</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Species</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Breed</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Age</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Gender</th>
                <th style={{ borderBottom: "1px solid #ddd" }}>Neutered</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.species}</td>
                  <td>{p.breed ?? "-"}</td>
                  <td>{p.age ?? "-"}</td>
                  <td>{p.gender}</td>
                  <td>{p.neutered ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ------------------- Add‑Pet form ------------------- */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Add a New Pet</h2>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>

          {/* Species */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Species:
              <input
                type="text"
                name="species"
                value={form.species}
                onChange={handleChange}
                required
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>

          {/* Breed */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Breed:
              <input
                type="text"
                name="breed"
                value={form.breed ?? ""}
                onChange={handleChange}
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>

          {/* Age */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Age:
              <input
                type="number"
                name="age"
                value={form.age ?? ""}
                onChange={handleChange}
                min={0}
                style={{ marginLeft: "0.5rem", width: "4rem" }}
              />
            </label>
          </div>

          {/* Birth date */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Birth date:
              <input
                type="date"
                name="birthDate"
                value={form.birthDate ?? ""}
                onChange={handleChange}
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>

          {/* Gender */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Gender:
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{ marginLeft: "0.5rem" }}
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>
          </div>

          {/* Neutered (checkbox) */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Neutered:
              <input
                type="checkbox"
                name="neutered"
                checked={form.neutered}
                onChange={handleChange}
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>

          {/* Description (textarea) */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Description:
              <textarea
                name="description"
                value={form.description ?? ""}
                onChange={handleChange}
                rows={3}
                style={{ marginLeft: "0.5rem", width: "100%" }}
              />
            </label>
          </div>

          {/* Submit button */}
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Add Pet
          </button>
        </form>
      </section>
    </main>
  );
}
