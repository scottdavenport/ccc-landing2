'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddSponsorForm } from './AddSponsorForm';
import { useEffect, useState } from 'react';
import { SponsorWithLevel } from '@/types/sponsors';

interface AddSponsorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSponsorAdded?: () => void;
  sponsorToEdit?: SponsorWithLevel | null;
}

export function AddSponsorDialog({ 
  isOpen, 
  onClose, 
  onSponsorAdded,
  sponsorToEdit 
}: AddSponsorDialogProps) {
  const [dialogTitle, setDialogTitle] = useState('Add New Sponsor');

  useEffect(() => {
    if (sponsorToEdit) {
      setDialogTitle('Edit Sponsor');
    } else {
      setDialogTitle('Add New Sponsor');
    }
  }, [sponsorToEdit]);

  const handleSponsorAdded = () => {
    onSponsorAdded?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <AddSponsorForm 
          onSponsorAdded={handleSponsorAdded} 
          sponsorToEdit={sponsorToEdit}
        />
      </DialogContent>
    </Dialog>
  );
}
