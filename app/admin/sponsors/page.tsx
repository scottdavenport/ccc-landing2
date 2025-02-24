'use client';

import { useState } from 'react';
import { SponsorForm } from '@/components/admin/SponsorForm';

export default function AdminSponsorsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Sponsor Management</h1>
      <div className="mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Add New Sponsor
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Add New Sponsor</h2>
          <SponsorForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="sponsors-list">
        {/* Sponsor list will be implemented here */}
      </div>
    </div>
  );
}
