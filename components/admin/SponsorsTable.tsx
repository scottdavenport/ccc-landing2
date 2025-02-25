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
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Plus, Trash2, Upload } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { AddSponsorDialog } from './AddSponsorDialog';
import { SponsorLogoDialog } from './SponsorLogoDialog';

// Base types from database
type Sponsor = Database['api']['Tables']['sponsors']['Row'];
type SponsorLevel = Database['api']['Tables']['sponsor_levels']['Row'];

// Extended type that includes joined sponsor_levels data and editing state
type SponsorWithLevel = {
  id: string;
  name: string;
  year: number;
  created_at: string;
  cloudinary_public_id?: string;
  image_url?: string;
  isEditing?: boolean;
  level: string;
  level_name?: string;
  level_amount?: number;
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

interface SponsorsTableProps {
  onAddSponsor: () => void;
}

export default function SponsorsTable({ onAddSponsor }: SponsorsTableProps) {
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<SponsorWithLevel[]>([]);
  const [levels, setLevels] = useState<Record<string, { name: string; amount: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select(`
          *,
          sponsor_levels (name, amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data) {
        setSponsors([]);
        return;
      }

      console.log('Sponsors with levels:', data);
      setSponsors(data);
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
          cloudinary_public_id,
        })
        .eq('id', selectedSponsorId);

      if (error) throw error;

      setSponsors(prev =>
        prev.map(sponsor =>
          sponsor.id === selectedSponsorId
            ? { ...sponsor, image_url, cloudinary_public_id }
            : sponsor
        )
      );
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
      flex: 1,
      minWidth: 180,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'sponsor_levels',
      headerName: 'Level',
      flex: 1,
      minWidth: 200,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const level = params.row.sponsor_levels;
        return level ? `${level.name} ($${level.amount})` : 'Unknown Level';
      },
    },
    {
      field: 'year',
      headerName: 'Year',
      flex: 0.5,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'image_url',
      headerName: 'Logo',
      flex: 0.8,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: params => {
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
      field: 'created_at',
      headerName: 'Added',
      flex: 0.8,
      minWidth: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => {
        try {
          const date = params.row.created_at;
          if (!date) return '-';
          const formattedDate = new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          return formattedDate;
        } catch (err) {
          console.error('Error formatting date:', err);
          return '-';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => (
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
  ];

  useEffect(() => {
    fetchSponsors();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>;
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
      const { error } = await supabase.from('sponsors').delete().in('id', ids);

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
      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>}

      {isLoading ? (
        <LoadingSpinner />
      ) : sponsors.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sponsors yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first sponsor</p>
          <Button onClick={onAddSponsor} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Sponsor
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-2">
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
          </div>

          <div className="border rounded-lg" style={{ height: 500 }}>
            <DataGrid
              rows={sponsors}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={newSelection => {
                setSelectedRows(newSelection);
              }}
            />
          </div>
        </>
      )}

      <SponsorLogoDialog
        isOpen={!!selectedSponsorId}
        onClose={() => setSelectedSponsorId(null)}
        onUpload={handleUpload}
        sponsorName={sponsors.find(s => s.id === selectedSponsorId)?.name || ''}
      />



      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedRows.length}{' '}
              selected sponsor{selectedRows.length === 1 ? '' : 's'}.
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
