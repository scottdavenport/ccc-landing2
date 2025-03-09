import React from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentYearSelector } from '@/components/admin/results/TournamentYearSelector';
import { FlightsResultsTab } from '@/components/admin/results/FlightsResultsTab';
import { ClosestToPinTab } from '@/components/admin/results/ClosestToPinTab';
import { LongDrivesTab } from '@/components/admin/results/LongDrivesTab';
import { PlayersTeamsTab } from '@/components/admin/results/PlayersTeamsTab';

export const dynamic = 'force-dynamic';

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tournament Results"
        description="Manage tournament results, winners, and statistics"
      />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Tournament Year</CardTitle>
            <CardDescription>
              Select a tournament year or create a new one to manage results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TournamentYearSelector />
          </CardContent>
        </Card>

        <Tabs defaultValue="flights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flights">Flights & Results</TabsTrigger>
            <TabsTrigger value="closest-to-pin">Closest to Pin</TabsTrigger>
            <TabsTrigger value="long-drives">Long Drives</TabsTrigger>
            <TabsTrigger value="players-teams">Players & Teams</TabsTrigger>
          </TabsList>
          <TabsContent value="flights" className="mt-6">
            <FlightsResultsTab />
          </TabsContent>
          <TabsContent value="closest-to-pin" className="mt-6">
            <ClosestToPinTab />
          </TabsContent>
          <TabsContent value="long-drives" className="mt-6">
            <LongDrivesTab />
          </TabsContent>
          <TabsContent value="players-teams" className="mt-6">
            <PlayersTeamsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 