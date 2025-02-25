'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { default as SponsorsTable } from '@/components/admin/SponsorsTable';
import { Button } from '@/components/ui/button';
import { AddSponsorDialog } from '@/components/admin/AddSponsorDialog';

export default function AdminPage() {
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Dashboard Overview</h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome to the CCC administration dashboard.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Sponsors</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">4</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Funds Raised</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">$50,000</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Days Until Event</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">45</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Management */}
      <div className="space-y-6">
        {/* Sponsors Table */}
        <div className="bg-white/80 backdrop-blur-sm shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-900">Sponsors</h2>
            <Button onClick={() => setIsAddSponsorOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </div>
          <SponsorsTable onAddSponsor={() => setIsAddSponsorOpen(true)} />
        </div>
      </div>
      
      <AddSponsorDialog
        isOpen={isAddSponsorOpen}
        onClose={() => setIsAddSponsorOpen(false)}
        onSponsorAdded={() => {
          // Refresh the page data when a sponsor is added
          window.location.reload();
        }}
      />
    </div>
  );
}
