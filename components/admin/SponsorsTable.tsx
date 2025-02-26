/**
 * SponsorsTable Component
 *
 * This component displays a table of sponsors with their logos, names, levels, and other details.
 * It provides functionality to view, upload, and delete sponsor logos using Cloudinary for storage
 * and Supabase for data management.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
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
import { supabase } from '@/lib/supabase/client';
import { SponsorLogoDialog } from './SponsorLogoDialog';

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
  sponsor_levels?: {
    name: string;
    amount: number;
  };
};

type SponsorLevel = {
  id: string;
  name: string;
  amount: number;
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

// Define action types for our reducer
type EditAction = 
  | { type: 'START_EDIT'; payload: { id: string; field: string; value: string | number } }
  | { type: 'CHANGE_VALUE'; payload: string | number }
  | { type: 'SAVE_EDIT'; payload?: any }
  | { type: 'FINISH_EDIT'; payload?: any }
  | { type: 'CANCEL_EDIT'; payload?: any };

// Define state type
interface EditState {
  editingCell: { id: string; field: string } | null;
  editValue: string | number;
  isProcessing: boolean;
}

// Initial state
const initialEditState: EditState = {
  editingCell: null,
  editValue: '',
  isProcessing: false
};

// Reducer function
function editReducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case 'START_EDIT':
      return { 
        ...state, 
        editingCell: { id: action.payload.id, field: action.payload.field },
        editValue: action.payload.value
      };
    case 'CHANGE_VALUE':
      return { ...state, editValue: action.payload };
    case 'SAVE_EDIT':
      return { ...state, isProcessing: true };
    case 'FINISH_EDIT':
      return { ...state, editingCell: null, editValue: '', isProcessing: false };
    case 'CANCEL_EDIT':
      return { ...state, editingCell: null, editValue: '', isProcessing: false };
    default:
      return state;
  }
}

// Memoized cell component to prevent unnecessary re-renders
const EditableCell = React.memo(({ 
  value, 
  isEditing, 
  field,
  id,
  options = null,
  onChange,
  onSave,
  onCancel
}: { 
  value: any; 
  isEditing: boolean; 
  field: string;
  id: string;
  options?: any[] | null;
  onChange: (value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className="w-full cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-150" 
           onClick={() => {}}>
        {value}
      </div>
    );
  }

  if (options) {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onSave}
        className="w-full px-2 py-1 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 animate-fadeIn"
        autoFocus
      >
        {options.map(option => (
          <option key={option.id || option} value={option.id || option}>
            {option.name || option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={field === 'year' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(field === 'year' ? Number(e.target.value) : e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      className="w-full px-2 py-1 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 animate-fadeIn"
      autoFocus
    />
  );
});

EditableCell.displayName = 'EditableCell';

export default function SponsorsTable({ onAddSponsor }: SponsorsTableProps) {
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<SponsorWithLevel[]>([]);
  const [levels, setLevels] = useState<SponsorLevel[]>([]);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [state, dispatch] = useReducer(editReducer, initialEditState);
  const sponsorsRef = useRef<SponsorWithLevel[]>([]);
  const levelsRef = useRef<SponsorLevel[]>([]);
  
  // Keep the refs in sync with the state
  useEffect(() => {
    sponsorsRef.current = sponsors;
  }, [sponsors]);
  
  useEffect(() => {
    levelsRef.current = levels;
  }, [levels]);
  
  // Generate an array of years (current year ± 3 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsorLevels = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('sponsor_levels').select('*');

      if (error) throw error;

      if (!data) {
        setLevels([]);
        return;
      }

      setLevels(data);
    } catch (err) {
      console.error('Error fetching sponsor levels:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sponsor levels');
    }
  }, []);

  const fetchSponsors = useCallback(async () => {
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
  }, []);

  const handleUploadClick = (sponsorId: string) => {
    setSelectedSponsorId(sponsorId);
  };

  const handleUpload = async (file: File) => {
    if (!selectedSponsorId) return;
    try {
      // Find current sponsor to get old image info
      const currentSponsor = sponsorsRef.current.find(s => s.id === selectedSponsorId);
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

  // Handle cell click to start editing
  const handleCellClick = useCallback((params: GridCellParams) => {
    // Only allow editing for name, level, and year fields
    if (!['name', 'level', 'year'].includes(params.field)) return;
    
    let initialValue;
    if (params.field === 'level') {
      const sponsor = sponsorsRef.current.find(s => s.id === params.id);
      initialValue = sponsor?.level || '';
    } else {
      initialValue = params.value;
    }
    
    dispatch({ 
      type: 'START_EDIT', 
      payload: { 
        id: params.id as string, 
        field: params.field, 
        value: initialValue 
      } 
    });
  }, []);

  // Handle saving cell edits
  const handleSaveCell = useCallback(async () => {
    if (!state.editingCell) return;
    
    try {
      dispatch({ type: 'SAVE_EDIT' });
      
      const { id, field } = state.editingCell;
      let updateData: { level?: string; name?: string; year?: number } = {};
      
      if (field === 'level') {
        updateData = { level: String(state.editValue) };
      } else if (field === 'name') {
        updateData = { name: String(state.editValue) };
      } else if (field === 'year') {
        updateData = { year: Number(state.editValue) };
      }
      
      const { error } = await supabase
        .from('sponsors')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local data
      if (sponsorsRef.current) {
        sponsorsRef.current = sponsorsRef.current.map(sponsor => {
          if (sponsor.id === id) {
            return { ...sponsor, ...updateData };
          }
          return sponsor;
        });
      }
      
      // Force re-render
      setSponsors(prev => [...prev]);
    } catch (error: any) {
      console.error('Error updating sponsor:', error.message);
    } finally {
      dispatch({ type: 'FINISH_EDIT' });
    }
  }, [state.editingCell, state.editValue]);

  // Handle cancel editing
  const handleCancelEdit = useCallback(() => {
    dispatch({ type: 'CANCEL_EDIT' });
  }, []);

  // Define columns with memoization
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params) => {
        const isEditing = state.editingCell?.id === params.id && state.editingCell?.field === 'name';
        
        return (
          <EditableCell
            value={isEditing ? state.editValue : params.value}
            isEditing={isEditing}
            field="name"
            id={params.id as string}
            onChange={(value) => dispatch({ type: 'CHANGE_VALUE', payload: value })}
            onSave={handleSaveCell}
            onCancel={handleCancelEdit}
          />
        );
      }
    },
    {
      field: 'level',
      headerName: 'Level',
      flex: 1,
      minWidth: 200,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const isEditing = state.editingCell?.id === params.id && state.editingCell?.field === 'level';
        const level = params.row && params.row.sponsor_levels ? params.row.sponsor_levels : null;
        
        return (
          <EditableCell
            value={isEditing ? state.editValue : level?.id || ''}
            isEditing={isEditing}
            field="level"
            id={params.id as string}
            options={levelsRef.current}
            onChange={(value) => dispatch({ type: 'CHANGE_VALUE', payload: value })}
            onSave={handleSaveCell}
            onCancel={handleCancelEdit}
          />
        );
      },
      valueGetter: (params) => {
        // Add null check for params.row before accessing sponsor_levels
        return params.row && params.row.sponsor_levels ? params.row.sponsor_levels.name : '';
      }
    },
    {
      field: 'year',
      headerName: 'Year',
      flex: 0.5,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const isEditing = state.editingCell?.id === params.id && state.editingCell?.field === 'year';
        const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
        
        return (
          <EditableCell
            value={isEditing ? state.editValue : params.value}
            isEditing={isEditing}
            field="year"
            id={params.id as string}
            options={years}
            onChange={(value) => dispatch({ type: 'CHANGE_VALUE', payload: value })}
            onSave={handleSaveCell}
            onCancel={handleCancelEdit}
          />
        );
      }
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
          const date = params.row && params.row.created_at ? params.row.created_at : null;
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
          onClick={() => params.row && params.row.id ? handleDelete([params.row.id]) : null}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ], [state.editingCell, state.editValue, handleSaveCell, handleCancelEdit]);

  // Add event listener for clicks outside editing cells
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Skip if we're not editing or if clicking on a select/option element
      if (!state.editingCell) return;
      
      const target = e.target as HTMLElement;
      if (target.tagName === 'OPTION' || target.tagName === 'SELECT' || target.tagName === 'INPUT') {
        return;
      }
      
      // Check if the click is outside any editable cell
      const isOutsideEditableCell = !target.closest('.MuiDataGrid-cell');
      if (isOutsideEditableCell) {
        handleSaveCell();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [state.editingCell, handleSaveCell]);

  // Fetch data on component mount
  useEffect(() => {
    fetchSponsors();
    fetchSponsorLevels();
  }, [fetchSponsors, fetchSponsorLevels]);

  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      // Delete from Supabase
      const { error } = await supabase.from('sponsors').delete().in('id', ids);

      if (error) throw error;

      // Update local state
      setSponsors(sponsorsRef.current.filter(sponsor => !ids.includes(sponsor.id)));
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

          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={sponsors}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={setSelectedRows}
              rowSelectionModel={selectedRows}
              getRowId={(row) => row.id}
              onCellClick={handleCellClick}
              sx={{ 
                width: '100%',
                boxSizing: 'border-box',
                '& .MUI-DataGrid-cell--editing': {
                  padding: 0,
                }
              }}
            />
          </div>
        </>
      )}

      <SponsorLogoDialog
        isOpen={!!selectedSponsorId}
        onClose={() => setSelectedSponsorId(null)}
        onUpload={handleUpload}
        sponsorName={sponsorsRef.current.find(s => s.id === selectedSponsorId)?.name || ''}
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
