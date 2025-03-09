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
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

type Contest = {
  id: string;
  name: string;
  tournament_year_id: string;
};

type Player = {
  id: string;
  name: string;
  team_id: string | null;
  team_name: string | null;
};

type ContestResult = {
  id: string;
  contest_id: string;
  contest_name: string;
  player_id: string;
  player_name: string;
  result: number; // Could be distance in yards
};

export function LongDrivesTab() {
  const searchParams = useSearchParams();
  const tournamentYearId = searchParams.get('yearId');
  
  const [contests, setContests] = useState<Contest[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [contestResults, setContestResults] = useState<ContestResult[]>([]);
  const [isLoadingContests, setIsLoadingContests] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  
  // For adding/editing contests
  const [contestDialogOpen, setContestDialogOpen] = useState(false);
  const [contestFormMode, setContestFormMode] = useState<'add' | 'edit'>('add');
  const [contestName, setContestName] = useState('');
  const [editingContestId, setEditingContestId] = useState<string | null>(null);
  
  // For adding/editing results
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultFormMode, setResultFormMode] = useState<'add' | 'edit'>('add');
  const [selectedContestId, setSelectedContestId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [distance, setDistance] = useState('');
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  
  // Fetch contests when tournament year changes
  useEffect(() => {
    if (!tournamentYearId) return;
    
    const fetchContests = async () => {
      setIsLoadingContests(true);
      try {
        const response = await fetch(`/api/contests?tournamentYearId=${tournamentYearId}`);
        if (!response.ok) throw new Error('Failed to fetch contests');
        
        const data = await response.json();
        setContests(data);
      } catch (error) {
        console.error('Error fetching contests:', error);
        toast.error('Failed to load contests');
      } finally {
        setIsLoadingContests(false);
      }
    };
    
    const fetchPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error('Failed to fetch players');
        
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
        toast.error('Failed to load players');
      } finally {
        setIsLoadingPlayers(false);
      }
    };
    
    const fetchResults = async () => {
      setIsLoadingResults(true);
      try {
        const response = await fetch('/api/contest-results');
        if (!response.ok) throw new Error('Failed to fetch contest results');
        
        const data = await response.json();
        
        // Filter results for contests in this tournament year
        if (contests.length > 0) {
          const contestIds = contests.map(contest => contest.id);
          const filteredResults = data.filter((result: ContestResult) => 
            contestIds.includes(result.contest_id)
          );
          setContestResults(filteredResults);
        }
      } catch (error) {
        console.error('Error fetching contest results:', error);
        toast.error('Failed to load contest results');
      } finally {
        setIsLoadingResults(false);
      }
    };
    
    fetchContests();
    fetchPlayers();
    fetchResults();
  }, [tournamentYearId, contests.length]);
  
  // Handle adding a new contest
  const handleAddContest = async () => {
    if (!tournamentYearId || !contestName.trim()) return;
    
    try {
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contestName,
          tournamentYearId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contest');
      }
      
      const newContest = await response.json();
      setContests(prev => [...prev, newContest]);
      
      toast.success('Contest created successfully');
      resetContestForm();
    } catch (error) {
      console.error('Error creating contest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create contest');
    }
  };
  
  // Handle adding a new contest result
  const handleAddResult = async () => {
    if (!selectedContestId || !selectedPlayerId || !distance) return;
    
    try {
      const distanceNum = parseFloat(distance);
      if (isNaN(distanceNum) || distanceNum <= 0) {
        toast.error('Distance must be a positive number');
        return;
      }
      
      const response = await fetch('/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestId: selectedContestId,
          playerId: selectedPlayerId,
          result: distanceNum
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contest result');
      }
      
      const newResult = await response.json();
      
      // Add contest name and player name for display
      const contestName = contests.find(contest => contest.id === selectedContestId)?.name || '';
      const playerName = players.find(player => player.id === selectedPlayerId)?.name || '';
      
      setContestResults(prev => [...prev, {
        ...newResult,
        contest_name: contestName,
        player_name: playerName,
      }]);
      
      toast.success('Long drive winner added successfully');
      resetResultForm();
    } catch (error) {
      console.error('Error creating contest result:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create contest result');
    }
  };
  
  // Reset contest form
  const resetContestForm = () => {
    setContestDialogOpen(false);
    setContestName('');
    setEditingContestId(null);
    setContestFormMode('add');
  };
  
  // Reset result form
  const resetResultForm = () => {
    setResultDialogOpen(false);
    setSelectedContestId('');
    setSelectedPlayerId('');
    setDistance('');
    setEditingResultId(null);
    setResultFormMode('add');
  };
  
  if (!tournamentYearId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please select a tournament year to manage long drive contests.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Long Drive Contests</CardTitle>
            <CardDescription>
              Manage long drive contests and winners
            </CardDescription>
          </div>
          <Dialog open={contestDialogOpen} onOpenChange={setContestDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Contest
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Long Drive Contest</DialogTitle>
                <DialogDescription>
                  Add a new long drive contest for this tournament year.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="contestName" className="text-right">
                    Contest Name
                  </label>
                  <Input
                    id="contestName"
                    placeholder="e.g., Hole 7 Long Drive"
                    value={contestName}
                    onChange={(e) => setContestName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetContestForm}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddContest} 
                  disabled={!contestName.trim()}
                >
                  Add Contest
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoadingContests ? (
            <div className="text-center py-4">Loading contests...</div>
          ) : contests.length > 0 ? (
            <div className="space-y-6">
              {contests.map((contest) => {
                // Filter results for this contest
                const contestResultsList = contestResults.filter(
                  result => result.contest_id === contest.id
                );
                
                return (
                  <div key={contest.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">{contest.name}</h3>
                      <Dialog open={resultDialogOpen && selectedContestId === contest.id} onOpenChange={(open) => {
                        if (open) {
                          setSelectedContestId(contest.id);
                        }
                        setResultDialogOpen(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Winner
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Long Drive Winner</DialogTitle>
                            <DialogDescription>
                              Add a winner for {contest.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="player" className="text-right">
                                Player
                              </label>
                              <div className="col-span-3">
                                <select 
                                  id="player"
                                  className="w-full p-2 border rounded"
                                  value={selectedPlayerId}
                                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                                >
                                  <option value="">Select Player</option>
                                  {players.map((player) => (
                                    <option key={player.id} value={player.id}>
                                      {player.name} {player.team_name ? `(${player.team_name})` : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="distance" className="text-right">
                                Distance (yards)
                              </label>
                              <Input
                                id="distance"
                                type="number"
                                step="1"
                                min="0"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={resetResultForm}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAddResult}
                              disabled={!selectedPlayerId || !distance}
                            >
                              Add Winner
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {contestResultsList.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Distance (yards)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contestResultsList.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell>{result.player_name}</TableCell>
                              <TableCell>{result.result}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
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
                        No winners recorded for this contest yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No long drive contests created yet. Add one using the button above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 