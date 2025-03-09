import { type NextRequest } from 'next/server';

export interface TournamentYear {
  id: string;
  year: string;
  created_at: string;
  updated_at: string;
}

export interface Flight {
  id: string;
  name: string;
  tournament_year_id: string;
  tournament_year_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  flight_id: string;
  flight_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  name: string;
  team_id: string | null;
  team_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  position: number;
  team_id: string;
  team_name?: string;
  flight_id?: string;
  flight_name?: string;
  tournament_year_id?: string;
  tournament_year_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Contest {
  id: string;
  name: string;
  tournament_year_id: string;
  tournament_year_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ContestResult {
  id: string;
  result: number;
  contest_id: string;
  contest_name?: string;
  player_id: string;
  player_name?: string;
  team_id?: string;
  team_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseError {
  message: string;
}

export type ApiResponse<T> = 
  | { data: T; error: null }
  | { data: null; error: string };

export type RequestHandler = (request: NextRequest) => Promise<Response>; 