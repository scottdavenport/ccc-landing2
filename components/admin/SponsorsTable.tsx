/**
 * SponsorsTable Component
 * 
 * This component displays a table of sponsors with their logos, names, levels, and other details.
 * It provides functionality to view and upload sponsor logos using Cloudinary for storage
 * and Supabase for data management.
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { Save, X, Upload, Plus, Trash2 } from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { SponsorLogoDialog } from './SponsorLogoDialog';
import { AddSponsorDialog } from './AddSponsorDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

// Base sponsor type from database
type Sponsor = Database['api']['Tables']['sponsors']['Row'];

// Extended type that includes joined sponsor_levels data and editing state
type SponsorWithLevel = Sponsor & {
  sponsor_levels?: {
    name: string;
  } | null;
  level_name: string;
  isEditing?: boolean;
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

type CellEditProps = {
  value: string;
  row: SponsorWithLevel;
  column: keyof SponsorWithLevel;
  onSave: (value: string) => void;
};

function YearPickerCell({ value: initialValue, onSave }: CellEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [year, setYear] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYear(value);
    setShowDropdown(true);
    
    if (value.length === 4 && /^\d{4}$/.test(value)) {
      const yearNum = parseInt(value);
      if (yearNum >= 1900 && yearNum <= currentYear) {
        setError(null);
      } else {
        setError(`Year must be between 1900 and ${currentYear}`);
      }
    } else {
      setError('Please enter a valid 4-digit year');
    }
  };

  const handleYearSelect = (selectedYear: number) => {
    setYear(String(selectedYear));
    setError(null);
    setShowDropdown(false);
  };

  const handleSave = () => {
    if (!error && year.length === 4) {
      onSave(year);
      setIsEditing(false);
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  if (isEditing) {
    return (
      <div className="relative w-full">
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <Input
              value={year}
              onChange={handleYearChange}
              onFocus={handleInputFocus}
              className="h-8 w-24 text-center"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !error) handleSave();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setShowDropdown(false);
                }
              }}
            />
            {showDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-background border rounded-md shadow-lg w-24 max-h-32 overflow-y-auto z-10">
                {years.map((y) => (
                  <div
                    key={y}
                    className="px-2 py-1 cursor-pointer hover:bg-muted text-center"
                    onClick={() => handleYearSelect(y)}
                  >
                    {y}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleSave}
            disabled={!!error}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => {
              setIsEditing(false);
              setShowDropdown(false);
              setYear(initialValue); // Reset to initial value on cancel
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-destructive text-center w-full">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <span 
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:text-primary transition-colors"
      >
        {year}
      </span>
    </div>
  );
}

function EditableCell({ value: initialValue, onSave }: CellEditProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
        />
        <Button size="icon" variant="ghost" onClick={handleSave}>
          <Save className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <span 
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:text-primary transition-colors text-base"
      >
        {value}
      </span>
    </div>
  );
}

export function SponsorsTable() {
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    sponsorIds: string[];
    isDeleting: boolean;
  }>({ isOpen: false, sponsorIds: [], isDeleting: false });
  const [sponsors, setSponsors] = useState<SponsorWithLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select(`
          *,
          sponsor_levels (name)
        `)
        .order('name');

      if (error) {
        throw error;
      }

      if (!data) {
        setSponsors([]);
        return;
      }

      const sponsorsWithLevelNames = (data as SponsorWithLevel[]).map(sponsor => ({
        ...sponsor,
        level_name: sponsor.sponsor_levels?.name || 'Unknown'
      }));

      setSponsors(sponsorsWithLevelNames);
    } catch (err) {
      console.error('Error fetching sponsors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sponsors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async (sponsorIds: string[]) => {
    setDeleteDialogState({
      isOpen: true,
      sponsorIds,
      isDeleting: false
    });
  };

  const handleDeleteConfirm = async () => {
    const { sponsorIds } = deleteDialogState;
    setDeleteDialogState(prev => ({ ...prev, isDeleting: true }));

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .in('id', sponsorIds);

      if (error) throw error;

      // Delete logos from Cloudinary
      const sponsorsToDelete = sponsors.filter(s => sponsorIds.includes(s.id));
      const publicIds = sponsorsToDelete
        .map(s => s.cloudinary_public_id)
        .filter(Boolean) as string[];

      if (publicIds.length > 0) {
        const formData = new FormData();
        publicIds.forEach(id => formData.append('publicIds[]', id));

        const deleteResponse = await fetch('/api/sponsors/logo', {
          method: 'DELETE',
          body: formData,
        });

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete logos from Cloudinary');
        }
      }

      // Update local state
      setSponsors(prev => prev.filter(s => !sponsorIds.includes(s.id)));
      setSelectedRows([]);
    } catch (err) {
      console.error('Error deleting sponsors:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete sponsors');
    } finally {
      setDeleteDialogState({ isOpen: false, sponsorIds: [], isDeleting: false });
    }
  };

  const handleUploadClick = (sponsorId: string) => {
    setSelectedSponsorId(sponsorId);
  };

  const handleCellEdit = async (sponsorId: string, field: keyof SponsorWithLevel, value: string) => {
    try {
      const { error } = await supabase
        .from('sponsors')
        .update({ [field]: value })
        .eq('id', sponsorId);

      if (error) throw error;

      setSponsors(prev => prev.map(sponsor => 
        sponsor.id === sponsorId 
          ? { ...sponsor, [field]: value }
          : sponsor
      ));
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      throw new Error(`Failed to update ${field}`);
    }
  };

  const handleUpload = async (file: File) => {
    if (!selectedSponsorId) return;
    try {
      // Find current sponsor to get old image info
      const currentSponsor = sponsors.find(s => s.id === selectedSponsorId);
      const oldPublicId = currentSponsor?.cloudinary_public_id;

      const formData = new FormData();
      formData.append('logo', file);
      
      // If replacing, add the old public_id to delete
      if (oldPublicId) {
        formData.append('oldPublicId', oldPublicId);
      }

      const uploadResponse = await fetch('/api/sponsors/logo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      const { image_url, cloudinary_public_id } = await uploadResponse.json();

      const { error } = await supabase
        .from('sponsors')
        .update({
          image_url,
          cloudinary_public_id
        })
        .eq('id', selectedSponsorId);

      if (error) throw error;

      setSponsors(prev => prev.map(sponsor => 
        sponsor.id === selectedSponsorId
          ? { ...sponsor, image_url, cloudinary_public_id }
          : sponsor
      ));
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw new Error('Failed to upload logo');
    } finally {
      setSelectedSponsorId(null);
    }
  };

  const columns: ColumnDef<SponsorWithLevel>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: () => <div className="text-center w-full text-lg font-bold">Name</div>,
      cell: ({ row, getValue }) => (
        <EditableCell
          value={getValue() as string}
          row={row.original}
          column="name"
          onSave={(value) => handleCellEdit(row.original.id, 'name', value)}
        />
      )
    },
    {
      accessorKey: 'level_name',
      header: () => <div className="text-center w-full text-lg font-bold">Level</div>,
      cell: ({ row, getValue }) => (
        <EditableCell
          value={getValue() as string}
          row={row.original}
          column="level_name"
          onSave={(value) => handleCellEdit(row.original.id, 'level_name', value)}
        />
      )
    },
    {
      accessorKey: 'year',
      header: () => <div className="text-center w-full text-lg font-bold">Year</div>,
      cell: ({ row, getValue }) => (
        <YearPickerCell
          value={String(getValue())}
          row={row.original}
          column="year"
          onSave={(value) => handleCellEdit(row.original.id, 'year', value)}
        />
      )
    },
    {
      id: 'logo',
      header: () => <div className="text-center w-full text-lg font-bold">Logo</div>,
      cell: ({ row }) => {
        const sponsor = row.original;
        return (
          <div className="flex items-center justify-center w-full py-4">
            {sponsor.image_url ? (
              <div 
                className="relative w-24 h-24 hover:scale-110 transition-transform cursor-pointer group"
                onClick={() => handleUploadClick(sponsor.id)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
                <Image
                  src={sponsor.image_url}
                  alt={`${sponsor.name} logo`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 96px) 100vw, 96px"
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUploadClick(sponsor.id)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'created_at',
      header: () => <div className="text-center w-full text-lg font-bold">Added</div>,
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return (
          <div className="flex items-center justify-center w-full">
            <span className="text-base">
              {date.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    fetchSponsors();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        {error}
      </div>
    );
  }

  if (sponsors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sponsors found. Add your first sponsor above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setIsAddSponsorOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Sponsor
        </Button>

        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => handleDeleteClick(selectedRows)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedRows.length})
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={sponsors}
        searchKey="name"
        className="[&>thead>tr>th]:py-4 [&>thead]:bg-muted/50 [&>tbody>tr>td]:py-3 [&>tbody>tr>td]:text-base"
        onRowSelectionChange={setSelectedRows}
      />

      {selectedSponsorId && (
        <SponsorLogoDialog
          isOpen={true}
          onClose={() => setSelectedSponsorId(null)}
          onUpload={handleUpload}
          sponsorName={sponsors.find(s => s.id === selectedSponsorId)?.name || ''}
        />
      )}

      <AddSponsorDialog
        isOpen={isAddSponsorOpen}
        onClose={() => setIsAddSponsorOpen(false)}
        onSponsorAdded={fetchSponsors}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() => setDeleteDialogState({ isOpen: false, sponsorIds: [], isDeleting: false })}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteDialogState.sponsorIds.length === 1 ? 'Sponsor' : 'Sponsors'}`}
        description={`Are you sure you want to delete ${deleteDialogState.sponsorIds.length === 1 ? 'this sponsor' : 'these sponsors'}? This action cannot be undone.`}
        isDeleting={deleteDialogState.isDeleting}
      />
    </div>
  );
}
