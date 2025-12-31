// app/pet/[id]/ClientWeightTable.tsx
'use client';   // <-- marks the whole file as a client component

import { useState } from 'react';
import { Weight } from './page'; // reuse the exported Weight type

/* -------------------------------------------------
   Helper to build the base URL (same as in page.tsx)
   ------------------------------------------------- */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
}

/* -------------------------------------------------
   Props for the component
   ------------------------------------------------- */
type Props = {
  initialWeights: Weight[];
  petId: number;
};

/* -------------------------------------------------
   Client component: table with Edit / Delete UI
   ------------------------------------------------- */
export default function ClientWeightTable({ initialWeights, petId }: Props) {
  // Local copy of the weights so UI updates instantly after edits/deletes
  const [weights, setWeights] = useState<Weight[]>(initialWeights);

  // Which weight (by id) is currently being edited? null = none.
  const [editingWeightId, setEditingWeightId] = useState<number | null>(null);

  // Temp fields while editing
  const [editWeightValue, setEditWeightValue] = useState<string>(''); // string for input binding
  const [editWeightDate, setEditWeightDate] = useState<string>(''); // YYYY‑MM‑DD

  /* -------------------------------------------------
     Delete handler
     ------------------------------------------------- */
  const handleDelete = async (weightId: number) => {
    if (!confirm('Delete this weight entry?')) return;

    const res = await fetch(
      `${getBaseUrl()}/api/pets/${petId}/weights/${weightId}`,
      { method: 'DELETE' }
    );

    if (!res.ok) {
      alert(`Delete failed (status ${res.status})`);
      return;
    }

    // Remove from local state
    setWeights((prev) => prev.filter((w) => w.id !== weightId));
  };

  /* -------------------------------------------------
     Start editing a row
     ------------------------------------------------- */
  const handleEditStart = (weight: Weight) => {
    setEditingWeightId(weight.id);
    setEditWeightValue(weight.weightKg.toString());
    setEditWeightDate(weight.measuredAt.slice(0, 10)); // keep YYYY‑MM‑DD
  };

  const handleEditCancel = () => {
    setEditingWeightId(null);
    setEditWeightValue('');
    setEditWeightDate('');
  };

  /* -------------------------------------------------
     Save edited weight (PUT request)
     ------------------------------------------------- */
  const handleEditSave = async (weightId: number) => {
    const parsedKg = parseFloat(editWeightValue);
    if (isNaN(parsedKg) || parsedKg <= 0) {
      alert('Enter a valid positive weight.');
      return;
    }

    const payload: any = { weightKg: parsedKg };
    if (editWeightDate) payload.measuredAt = editWeightDate; // ISO‑compatible

    const res = await fetch(
      `${getBaseUrl()}/api/pets/${petId}/weights/${weightId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      alert(`Update failed (status ${res.status})`);
      return;
    }

    const updatedWeight: Weight = await res.json();

    // Update local state
    setWeights((prev) =>
      prev.map((w) => (w.id === weightId ? updatedWeight : w))
    );

    // Exit edit mode
    handleEditCancel();
  };

  /* -------------------------------------------------
     Render the table
     ------------------------------------------------- */
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '0.5rem',
      }}
    >
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ddd', padding: '4px' }}>
            Date
          </th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '4px' }}>
            Weight (kg)
          </th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '4px' }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {weights.map((w) => (
          <tr key={w.id}>
            {/* ---------- Normal view ---------- */}
            {editingWeightId !== w.id ? (
              <>
                <td style={{ padding: '4px' }}>
                  {new Date(w.measuredAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '4px' }}>{w.weightKg}</td>
                <td style={{ padding: '4px' }}>
                  <button
                    onClick={() => handleEditStart(w)}
                    style={{
                      marginRight: '0.5rem',
                      background: '#0066cc',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    style={{
                      background: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </>
            ) : (
              /* ---------- Edit mode ---------- */
              <>
                <td style={{ padding: '4px' }}>
                  <input
                    type="date"
                    value={editWeightDate}
                    onChange={(e) => setEditWeightDate(e.target.value)}
                    style={{ width: '130px' }}
                  />
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={editWeightValue}
                    onChange={(e) => setEditWeightValue(e.target.value)}
                    style={{ width: '80px' }}
                  />
                </td>
                <td style={{ padding: '4px' }}>
                  <button
                    onClick={() => handleEditSave(w.id)}
                    style={{
                      marginRight: '0.5rem',
                      background: '#27ae60',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    style={{
                      background: '#777',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
