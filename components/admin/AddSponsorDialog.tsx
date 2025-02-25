'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddSponsorForm } from './AddSponsorForm';

interface AddSponsorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSponsorAdded?: () => void;
}

export function AddSponsorDialog({ isOpen, onClose, onSponsorAdded }: AddSponsorDialogProps) {
  const handleSponsorAdded = () => {
    onSponsorAdded?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Sponsor</DialogTitle>
        </DialogHeader>
        <AddSponsorForm onSponsorAdded={handleSponsorAdded} />
      </DialogContent>
    </Dialog>
  );
}
