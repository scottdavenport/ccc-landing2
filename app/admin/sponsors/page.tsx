'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { default as SponsorsTable } from '@/components/admin/SponsorsTable';
import { Button } from '@/components/ui/button';
import { AddSponsorDialog } from '@/components/admin/AddSponsorDialog';
import { SponsorWithLevel } from '@/types/sponsors';

export const dynamic = 'force-dynamic';

export default function AdminSponsorsPage() {
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorWithLevel | null>(null);

  const handleEditSponsor = (sponsor: SponsorWithLevel) => {
    setSelectedSponsor(sponsor);
    setIsAddSponsorOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddSponsorOpen(false);
    setSelectedSponsor(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">Sponsors</h2>
          <Button onClick={() => setIsAddSponsorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sponsor
          </Button>
        </div>
        <SponsorsTable 
          onAddSponsor={() => setIsAddSponsorOpen(true)} 
          onEditSponsor={handleEditSponsor}
        />
      </div>
      
      <AddSponsorDialog
        isOpen={isAddSponsorOpen}
        onClose={handleCloseDialog}
        sponsorToEdit={selectedSponsor}
        onSponsorAdded={() => {
          // Refresh the page data when a sponsor is added or edited
          window.location.reload();
        }}
      />
    </div>
  );
}
