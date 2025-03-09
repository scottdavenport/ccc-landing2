'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

type Flight = {
  id: string;
  name: string;
  tournament_year_id: string;
};

type Team = {
  id: string;
  name: string;
  flight_id: string;
};

type Result = {
  id: string;
  team_id: string;
  team_name: string;
  position: number;
  flight_id: string;
  flight_name: string;
};

export function FlightsResultsTab() {
  const searchParams = useSearchParams();
  const tournamentYearId = searchParams.get('yearId');
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  
  // For adding/editing flights
  const [flightDialogOpen, setFlightDialogOpen] = useState(false);
  const [flightFormMode, setFlightFormMode] = useState<'add' | 'edit'>('add');
  const [flightName, setFlightName] = useState('');
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);
  
  // For adding/editing results
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultFormMode, setResultFormMode] = useState<'add' | 'edit'>('add');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [position, setPosition] = useState('');
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  
  // Fetch flights when tournament year changes
  useEffect(() => {
    if (!tournamentYearId) return;
    
    const fetchFlights = async () => {
      setIsLoadingFlights(true);
      try {
        const response = await fetch(`/api/flights?tournamentYearId=${tournamentYearId}`);
        if (!response.ok) throw new Error('Failed to fetch flights');
        
        const data = await response.json();
        setFlights(data);
        
        // Select the first flight by default if available
        if (data.length > 0 && !selectedFlight) {
          setSelectedFlight(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching flights:', error);
        toast.error('Failed to load flights');
      } finally {
        setIsLoadingFlights(false);
      }
    };
    
    fetchFlights();
  }, [tournamentYearId, selectedFlight]);
  
  // Fetch teams and results when flight selection changes
  useEffect(() => {
    if (!selectedFlight) return;
    
    const fetchTeamsAndResults = async () => {
      setIsLoadingTeams(true);
      setIsLoadingResults(true);
      
      try {
        // Fetch teams for the selected flight
        const teamsResponse = await fetch(`/api/teams?flightId=${selectedFlight}`);
        if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
        
        // Fetch results for the selected flight
        const resultsResponse = await fetch(`/api/results?flightId=${selectedFlight}`);
        if (!resultsResponse.ok) throw new Error('Failed to fetch results');
        const resultsData = await resultsResponse.json();
        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching teams and results:', error);
        toast.error('Failed to load teams or results');
      } finally {
        setIsLoadingTeams(false);
        setIsLoadingResults(false);
      }
    };
    
    fetchTeamsAndResults();
  }, [selectedFlight]);
  
  // Handle adding a new flight
  const handleAddFlight = async () => {
    if (!tournamentYearId || !flightName.trim()) return;
    
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: flightName,
          tournamentYearId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create flight');
      }
      
      const newFlight = await response.json();
      setFlights(prev => [...prev, newFlight]);
      setSelectedFlight(newFlight.id);
      
      toast.success('Flight created successfully');
      resetFlightForm();
    } catch (error) {
      console.error('Error creating flight:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create flight');
    }
  };
  
  // Handle editing a flight
  const handleEditFlight = async () => {
    if (!editingFlightId || !flightName.trim()) return;
    
    try {
      const response = await fetch(`/api/flights/${editingFlightId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: flightName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update flight');
      }
      
      const updatedFlight = await response.json();
      setFlights(prev => prev.map(flight => 
        flight.id === editingFlightId ? updatedFlight : flight
      ));
      
      toast.success('Flight updated successfully');
      resetFlightForm();
    } catch (error) {
      console.error('Error updating flight:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update flight');
    }
  };
  
  // Handle adding a new result
  const handleAddResult = async () => {
    if (!selectedFlight || !selectedTeamId || !position) return;
    
    try {
      const positionNum = parseInt(position);
      if (isNaN(positionNum) || positionNum < 1) {
        toast.error('Position must be a positive number');
        return;
      }
      
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: selectedTeamId,
          position: positionNum
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create result');
      }
      
      const newResult = await response.json();
      
      // Add team name to the result for display
      const teamName = teams.find(team => team.id === selectedTeamId)?.name || '';
      const flightName = flights.find(flight => flight.id === selectedFlight)?.name || '';
      
      setResults(prev => [...prev, {
        ...newResult,
        team_name: teamName,
        flight_id: selectedFlight,
        flight_name: flightName
      }]);
      
      toast.success('Result created successfully');
      resetResultForm();
    } catch (error) {
      console.error('Error creating result:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create result');
    }
  };
  
  // Handle editing a result
  const handleEditResult = async () => {
    if (!editingResultId || !selectedTeamId || !position) return;
    
    try {
      const positionNum = parseInt(position);
      if (isNaN(positionNum) || positionNum < 1) {
        toast.error('Position must be a positive number');
        return;
      }
      
      const response = await fetch(`/api/results/${editingResultId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: selectedTeamId,
          position: positionNum
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update result');
      }
      
      const updatedResult = await response.json();
      
      // Add team name to the result for display
      const teamName = teams.find(team => team.id === selectedTeamId)?.name || '';
      const flightName = flights.find(flight => flight.id === selectedFlight)?.name || '';
      
      setResults(prev => prev.map(result => 
        result.id === editingResultId ? {
          ...updatedResult,
          team_name: teamName,
          flight_id: selectedFlight,
          flight_name: flightName
        } : result
      ));
      
      toast.success('Result updated successfully');
      resetResultForm();
    } catch (error) {
      console.error('Error updating result:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update result');
    }
  };
  
  // Reset flight form
  const resetFlightForm = () => {
    setFlightDialogOpen(false);
    setFlightName('');
    setEditingFlightId(null);
    setFlightFormMode('add');
  };
  
  // Reset result form
  const resetResultForm = () => {
    setResultDialogOpen(false);
    setSelectedTeamId('');
    setPosition('');
    setEditingResultId(null);
    setResultFormMode('add');
  };
  
  // Prepare to edit a flight
  const prepareEditFlight = (flight: Flight) => {
    setFlightFormMode('edit');
    setEditingFlightId(flight.id);
    setFlightName(flight.name);
    setFlightDialogOpen(true);
  };
  
  // Prepare to edit a result
  const prepareEditResult = (result: Result) => {
    setResultFormMode('edit');
    setEditingResultId(result.id);
    setSelectedTeamId(result.team_id);
    setPosition(result.position.toString());
    setResultDialogOpen(true);
  };
  
  if (!tournamentYearId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please select a tournament year to manage flights and results.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Flights Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Flights</CardTitle>
            <CardDescription>
              Manage flights for the tournament
            </CardDescription>
          </div>
          <Dialog open={flightDialogOpen} onOpenChange={setFlightDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { setFlightFormMode('add'); setFlightName(''); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Flight
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {flightFormMode === 'add' ? 'Add New Flight' : 'Edit Flight'}
                </DialogTitle>
                <DialogDescription>
                  {flightFormMode === 'add' 
                    ? 'Add a new flight to the tournament.' 
                    : 'Edit the flight details.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="flightName" className="text-right">
                    Flight Name
                  </label>
                  <Input
                    id="flightName"
                    value={flightName}
                    onChange={(e) => setFlightName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={resetFlightForm}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={flightFormMode === 'add' ? handleAddFlight : handleEditFlight}
                  disabled={!flightName.trim()}
                >
                  {flightFormMode === 'add' ? 'Add Flight' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full max-w-xs">
              <Select 
                value={selectedFlight} 
                onValueChange={setSelectedFlight}
                disabled={isLoadingFlights || flights.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingFlights ? "Loading flights..." : "Select a flight"} />
                </SelectTrigger>
                <SelectContent>
                  {flights.map((flight) => (
                    <SelectItem key={flight.id} value={flight.id}>
                      {flight.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedFlight && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Flight Results</h3>
                  <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => { setResultFormMode('add'); setSelectedTeamId(''); setPosition(''); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Result
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {resultFormMode === 'add' ? 'Add New Result' : 'Edit Result'}
                        </DialogTitle>
                        <DialogDescription>
                          {resultFormMode === 'add' 
                            ? 'Add a new result for a team.' 
                            : 'Edit the result details.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="teamSelect" className="text-right">
                            Team
                          </label>
                          <div className="col-span-3">
                            <Select 
                              value={selectedTeamId} 
                              onValueChange={setSelectedTeamId}
                            >
                              <SelectTrigger id="teamSelect">
                                <SelectValue placeholder="Select a team" />
                              </SelectTrigger>
                              <SelectContent>
                                {teams.map((team) => (
                                  <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="position" className="text-right">
                            Position
                          </label>
                          <Input
                            id="position"
                            type="number"
                            min="1"
                            step="1"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={resetResultForm}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={resultFormMode === 'add' ? handleAddResult : handleEditResult}
                          disabled={!selectedTeamId || !position}
                        >
                          {resultFormMode === 'add' ? 'Add Result' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {isLoadingResults ? (
                  <div className="text-center py-4">Loading results...</div>
                ) : results.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>{result.position}</TableCell>
                          <TableCell>{result.team_name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => prepareEditResult(result)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No results found for this flight. Add a result using the button above.
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 