/**
 * SponsorsTable Component
 *
 * This component displays a table of sponsors with their logos, names, levels, and other details.
 * It provides functionality to view, upload, and delete sponsor logos using Cloudinary for storage
 * and Neon for data management.
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DataGrid, GridColDef, GridRowSelectionModel, GridCellParams } from '@mui/x-data-grid';
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
import { SponsorLogoDialog } from './SponsorLogoDialog';
import { SponsorWithLevel } from '@/types/sponsors';

// Helper function to delete images from Cloudinary
const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });
    
    if (!result.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }
    
    return await result.json();
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
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
  onEditSponsor?: (sponsor: SponsorWithLevel) => void;
}

export default function SponsorsTable({ onAddSponsor, onEditSponsor }: SponsorsTableProps) {
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<SponsorWithLevel[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sponsors');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch sponsors');
      }
      
      const data = await response.json();

      if (!data || data.length === 0) {
        setSponsors([]);
        return;
      }

      // Transform the data to match the SponsorWithLevel type
      const transformedSponsors = data.map((sponsor: {
        id: string;
        name: string;
        level: string;
        year: number;
        website_url: string | null;
        image_url: string | null;
        cloudinary_public_id: string | null;
        created_at: string;
        updated_at: string;
        level_name: string;
        level_amount: number;
      }) => ({
        id: sponsor.id,
        name: sponsor.name,
        level: sponsor.level,
        year: sponsor.year,
        website_url: sponsor.website_url,
        image_url: sponsor.image_url,
        cloudinary_public_id: sponsor.cloudinary_public_id,
        created_at: sponsor.created_at,
        updated_at: sponsor.updated_at,
        level_name: sponsor.level_name,
        level_amount: sponsor.level_amount,
        sponsor_levels: {
          name: sponsor.level_name,
          amount: null
        }
      }));

      console.log('Sponsors with levels:', transformedSponsors);
      setSponsors(transformedSponsors);
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

      // Upload to Cloudinary via our API
      const uploadResponse = await fetch('/api/sponsors/logo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const { image_url, cloudinary_public_id } = await uploadResponse.json();

      // Update the sponsor in the database
      const updateResponse = await fetch('/api/sponsors', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedSponsorId,
          image_url,
          cloudinary_public_id,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Failed to update sponsor');
      }

      // Update local state
      setSponsors(
        sponsors.map(s =>
          s.id === selectedSponsorId
            ? { ...s, image_url, cloudinary_public_id }
            : s
        )
      );

      // Close dialog
      setSelectedSponsorId(null);
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
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
        // Simplified to only show level name
        const level = params.row && params.row.sponsor_levels ? params.row.sponsor_levels : null;
        return level?.name || 'Unknown Level';
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
      field: 'website_url',
      headerName: 'Website',
      flex: 1,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => {
        const url = params.row.website_url;
        if (!url) return '-';
        return (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate max-w-full"
          >
            {url.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        );
      },
    },
    {
      field: 'image_url',
      headerName: 'Logo',
      flex: 0.8,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => {
        const sponsor = params.row;
        return (
          <div className="flex items-center justify-center w-full h-full py-2">
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
          onClick={() => setSingleDeleteId(params.row.id)}
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

  const deleteSponsors = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      // Delete sponsors one by one
      for (const id of ids) {
        // Delete from database via API
        const response = await fetch(`/api/sponsors?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete sponsor');
        }

        const data = await response.json();
        
        // If the sponsor had a Cloudinary image, delete it
        if (data.cloudinary_public_id) {
          try {
            await deleteFromCloudinary(data.cloudinary_public_id);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
            // Continue even if Cloudinary delete fails
          }
        }
      }

      // Update local state
      setSponsors(sponsors.filter(sponsor => !ids.includes(sponsor.id)));
      setSelectedRows([]);
      setSingleDeleteId(null);
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting sponsors:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete sponsors');
    }
  };

  const handleRowClick = (params: GridCellParams) => {
    // Don't trigger edit mode if clicking on logo or actions column
    if (params.field === 'image_url' || params.field === 'actions') {
      return;
    }
    
    // Check if the click is on the checkbox column (field will be undefined or empty for checkbox)
    if (!params.field || params.field === '__check__') {
      return;
    }
    
    // Only proceed if the field is one of our defined column fields
    // This ensures checkbox selection doesn't trigger edit modal
    const definedFields = columns.map(col => col.field);
    if (!definedFields.includes(params.field)) {
      return;
    }
    
    // Find the full sponsor data
    const sponsor = sponsors.find(s => s.id === params.id);
    if (sponsor && onEditSponsor) {
      onEditSponsor(sponsor);
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
              onCellClick={handleRowClick}
              sx={{
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
                  padding: '10px',
                },
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

      {/* Confirmation dialog for bulk delete */}
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
              onClick={() => deleteSponsors(selectedRows as string[])}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog for single delete */}
      <AlertDialog open={!!singleDeleteId} onOpenChange={(open) => !open && setSingleDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sponsor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => singleDeleteId && deleteSponsors([singleDeleteId])}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
