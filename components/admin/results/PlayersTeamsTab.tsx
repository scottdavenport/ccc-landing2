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
import { Plus, Edit, UserPlus } from 'lucide-react';
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
  flight_name?: string;
};

type Player = {
  id: string;
  name: string;
  team_id: string | null;
  team_name: string | null;
};

export function PlayersTeamsTab() {
  const searchParams = useSearchParams();
  const tournamentYearId = searchParams.get('yearId');
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  
  // For adding/editing teams
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamFormMode, setTeamFormMode] = useState<'add' | 'edit'>('add');
  const [teamName, setTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  
  // For adding/editing players
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [playerFormMode, setPlayerFormMode] = useState<'add' | 'edit'>('add');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  
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
  
  // Fetch teams when flight selection changes
  useEffect(() => {
    if (!selectedFlight) return;
    
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      try {
        const response = await fetch(`/api/teams?flightId=${selectedFlight}`);
        if (!response.ok) throw new Error('Failed to fetch teams');
        
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
      } finally {
        setIsLoadingTeams(false);
      }
    };
    
    fetchTeams();
  }, [selectedFlight]);
  
  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        // If we have teams, fetch players for those teams
        const teamIds = teams.map(team => team.id);
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error('Failed to fetch players');
        
        const data = await response.json();
        // Filter players to show only those for current teams or unassigned
        const filteredPlayers = teamIds.length > 0 
          ? data.filter((player: Player) => 
              player.team_id === null || teamIds.includes(player.team_id)
            )
          : data;
        
        setPlayers(filteredPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
        toast.error('Failed to load players');
      } finally {
        setIsLoadingPlayers(false);
      }
    };
    
    fetchPlayers();
  }, [teams]);
  
  // Handle adding a new team
  const handleAddTeam = async () => {
    if (!selectedFlight || !teamName.trim()) return;
    
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          flightId: selectedFlight
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }
      
      const newTeam = await response.json();
      setTeams(prev => [...prev, newTeam]);
      
      toast.success('Team created successfully');
      resetTeamForm();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    }
  };
  
  // Handle editing a team
  const handleEditTeam = async () => {
    if (!editingTeamId || !teamName.trim()) return;
    
    try {
      const response = await fetch(`/api/teams/${editingTeamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team');
      }
      
      const updatedTeam = await response.json();
      setTeams(prev => prev.map(team => 
        team.id === editingTeamId ? updatedTeam : team
      ));
      
      toast.success('Team updated successfully');
      resetTeamForm();
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update team');
    }
  };
  
  // Handle adding a new player
  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          teamId: selectedTeamId || null
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create player');
      }
      
      const newPlayer = await response.json();
      
      // Add team name to the player for display
      const teamName = selectedTeamId 
        ? teams.find(team => team.id === selectedTeamId)?.name 
        : null;
      
      setPlayers(prev => [...prev, {
        ...newPlayer,
        team_name: teamName
      }]);
      
      toast.success('Player created successfully');
      resetPlayerForm();
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create player');
    }
  };
  
  // Handle editing a player
  const handleEditPlayer = async () => {
    if (!editingPlayerId || !playerName.trim()) return;
    
    try {
      const response = await fetch(`/api/players/${editingPlayerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          teamId: selectedTeamId || null
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update player');
      }
      
      const updatedPlayer = await response.json();
      
      // Add team name to the player for display
      const teamName = selectedTeamId 
        ? teams.find(team => team.id === selectedTeamId)?.name 
        : null;
      
      setPlayers(prev => prev.map(player => 
        player.id === editingPlayerId ? {
          ...updatedPlayer,
          team_name: teamName
        } : player
      ));
      
      toast.success('Player updated successfully');
      resetPlayerForm();
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update player');
    }
  };
  
  // Reset team form
  const resetTeamForm = () => {
    setTeamDialogOpen(false);
    setTeamName('');
    setEditingTeamId(null);
    setTeamFormMode('add');
  };
  
  // Reset player form
  const resetPlayerForm = () => {
    setPlayerDialogOpen(false);
    setPlayerName('');
    setSelectedTeamId('');
    setEditingPlayerId(null);
    setPlayerFormMode('add');
  };
  
  // Prepare to edit a team
  const prepareEditTeam = (team: Team) => {
    setTeamFormMode('edit');
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamDialogOpen(true);
  };
  
  // Prepare to edit a player
  const prepareEditPlayer = (player: Player) => {
    setPlayerFormMode('edit');
    setEditingPlayerId(player.id);
    setPlayerName(player.name);
    setSelectedTeamId(player.team_id || '');
    setPlayerDialogOpen(true);
  };
  
  if (!tournamentYearId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please select a tournament year to manage players and teams.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Flight Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Flight</CardTitle>
          <CardDescription>
            Choose a flight to manage its teams and players
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      
      {/* Teams Section */}
      {selectedFlight && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Manage teams for this flight
              </CardDescription>
            </div>
            <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { setTeamFormMode('add'); setTeamName(''); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {teamFormMode === 'add' ? 'Add New Team' : 'Edit Team'}
                  </DialogTitle>
                  <DialogDescription>
                    {teamFormMode === 'add' 
                      ? 'Add a new team to this flight.' 
                      : 'Edit the team details.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="teamName" className="text-right">
                      Team Name
                    </label>
                    <Input
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={resetTeamForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={teamFormMode === 'add' ? handleAddTeam : handleEditTeam}
                    disabled={!teamName.trim()}
                  >
                    {teamFormMode === 'add' ? 'Add Team' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoadingTeams ? (
              <div className="text-center py-4">Loading teams...</div>
            ) : teams.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => prepareEditTeam(team)}
                          className="mr-2"
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
                No teams found for this flight. Add a team using the button above.
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Players Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Players</CardTitle>
            <CardDescription>
              Manage players and their team assignments
            </CardDescription>
          </div>
          <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { 
                setPlayerFormMode('add'); 
                setPlayerName(''); 
                setSelectedTeamId('');
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {playerFormMode === 'add' ? 'Add New Player' : 'Edit Player'}
                </DialogTitle>
                <DialogDescription>
                  {playerFormMode === 'add' 
                    ? 'Add a new player and optionally assign to a team.' 
                    : 'Edit the player details and team assignment.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="playerName" className="text-right">
                    Player Name
                  </label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
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
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={resetPlayerForm}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={playerFormMode === 'add' ? handleAddPlayer : handleEditPlayer}
                  disabled={!playerName.trim()}
                >
                  {playerFormMode === 'add' ? 'Add Player' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoadingPlayers ? (
            <div className="text-center py-4">Loading players...</div>
          ) : players.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.team_name || 'Unassigned'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => prepareEditPlayer(player)}
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
              No players found. Add a player using the button above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 