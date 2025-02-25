/**
 * SponsorsTable Component
 * 
 * This component displays a table of sponsors with their logos, names, levels, and other details.
 * It provides functionality to view, upload, and delete sponsor logos using Cloudinary for storage
 * and Supabase for data management.
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import { SponsorLogoDialog } from './SponsorLogoDialog';
import { AddSponsorDialog } from './AddSponsorDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Base sponsor type from database
type Sponsor = Database['api']['Tables']['sponsors']['Row'];

// Extended type that includes joined sponsor_levels data and editing state
type SponsorWithLevel = Sponsor & {
  sponsor_levels?: {
    name: string;
  } | null;
  level_name: string;
  isEditing?: boolean;
  id: string; // Required for MUI DataGrid
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}



export default function SponsorsTable() {
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  const [sponsors, setSponsors] = useState<SponsorWithLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      editable: true,
    },
    {
      field: 'level_name',
      headerName: 'Level',
      width: 150,
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 100,
      editable: true,
      type: 'number',
    },
    {
      field: 'image_url',
      headerName: 'Logo',
      width: 150,
      renderCell: (params) => {
        const sponsor = params.row;
        return (
          <div className="flex items-center justify-center w-full py-2">
            {sponsor.image_url ? (
              <div 
                className="relative w-12 h-12 hover:scale-110 transition-transform cursor-pointer group"
                onClick={() => handleUploadClick(sponsor.id)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
                <Image
                  src={sponsor.image_url}
                  alt={`${sponsor.name} logo`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 48px) 100vw, 48px"
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUploadClick(sponsor.id)}
                className="gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload
              </Button>
            )}
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete([params.row.id])}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Added',
      width: 180,
      type: 'dateTime',
      valueFormatter: ({ value }) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
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

  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .in('id', ids);

      if (error) throw error;

      // Update local state
      setSponsors(sponsors.filter(sponsor => !ids.includes(sponsor.id)));
      setSelectedRows([]);
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting sponsors:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete sponsors');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sponsors</h2>
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedRows.length})
            </Button>
          )}
          <Button
            onClick={() => setIsAddSponsorOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sponsor
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="border rounded-lg" style={{ height: 500 }}>
          <DataGrid
            rows={sponsors}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
            processRowUpdate={async (updatedRow: SponsorWithLevel, originalRow: SponsorWithLevel) => {
              const field = Object.keys(updatedRow).find(key => {
                const k = key as keyof SponsorWithLevel;
                return updatedRow[k] !== originalRow[k];
              }) as keyof SponsorWithLevel;
              if (!field) return originalRow;
              
              try {
                const value = updatedRow[field];
                if (value === undefined) return originalRow;
                
                // Convert value to string if it's a number or boolean
                const stringValue = typeof value === 'object' && value !== null ? value.name : String(value);
                await handleCellEdit(updatedRow.id, field, stringValue);
                return updatedRow;
              } catch (err) {
                console.error('Error updating cell:', err);
                setError(err instanceof Error ? err.message : 'Failed to update sponsor');
                return originalRow;
              }
            }}
            onProcessRowUpdateError={(error) => {
              console.error('Error updating row:', error);
              setError('Failed to update sponsor');
            }}
          />
        </div>
      )}

      <SponsorLogoDialog
        isOpen={!!selectedSponsorId}
        onClose={() => setSelectedSponsorId(null)}
        onUpload={handleUpload}
        sponsorName={sponsors.find(s => s.id === selectedSponsorId)?.name || ''}
      />

      <AddSponsorDialog
        isOpen={isAddSponsorOpen}
        onClose={() => setIsAddSponsorOpen(false)}
        onSponsorAdded={fetchSponsors}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedRows.length} selected sponsor{selectedRows.length === 1 ? '' : 's'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDelete(selectedRows as string[])}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
