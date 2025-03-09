'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

type TournamentYear = {
  id: string;
  year: string;
};

export function TournamentYearSelector() {
  const [tournamentYears, setTournamentYears] = useState<TournamentYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [newYear, setNewYear] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch tournament years on component mount
  useEffect(() => {
    const fetchTournamentYears = async () => {
      try {
        const response = await fetch('/api/tournament-years');
        if (!response.ok) throw new Error('Failed to fetch tournament years');
        
        const data = await response.json();
        setTournamentYears(data);
        
        // If there's a year in the URL, select it
        const yearIdFromUrl = searchParams.get('yearId');
        if (yearIdFromUrl && data.some((y: TournamentYear) => y.id === yearIdFromUrl)) {
          setSelectedYear(yearIdFromUrl);
        } else if (data.length > 0) {
          // Select the most recent year by default
          setSelectedYear(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching tournament years:', error);
        toast.error('Failed to load tournament years');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentYears();
  }, [searchParams]);

  // Handle year selection
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    
    // Update URL to include the selected year
    const params = new URLSearchParams(searchParams.toString());
    params.set('yearId', value);
    router.push(`/admin/results?${params.toString()}`);
  };

  // Create a new tournament year
  const handleCreateYear = async () => {
    if (!newYear || isCreating) return;

    try {
      setIsCreating(true);
      
      const response = await fetch('/api/tournament-years', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: newYear }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tournament year');
      }

      const createdYear = await response.json();
      
      // Add the new year to the list and select it
      setTournamentYears(prev => [createdYear, ...prev]);
      setSelectedYear(createdYear.id);
      
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('yearId', createdYear.id);
      router.push(`/admin/results?${params.toString()}`);
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setNewYear('');
      
      toast.success(`Tournament year ${createdYear.year} created successfully`);
    } catch (error) {
      console.error('Error creating tournament year:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tournament year');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Select 
          value={selectedYear} 
          onValueChange={handleYearChange}
          disabled={loading || tournamentYears.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loading ? "Loading years..." : "Select a tournament year"} />
          </SelectTrigger>
          <SelectContent>
            {tournamentYears.map((year) => (
              <SelectItem key={year.id} value={year.id}>
                {year.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tournament Year</DialogTitle>
            <DialogDescription>
              Enter the year for the new tournament.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              type="number"
              placeholder="YYYY"
              min="1900"
              max="2100"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateYear} 
              disabled={!newYear || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Year'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 