const { GET, POST } = require('../../../app/api/contest-results/route');
const { prisma } = require('../../../lib/prisma');
const { auth } = require('@clerk/nextjs/server');

// Mock the modules
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn()
  }
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

// Mock NextRequest
class MockNextRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.body = options.body || null;
    this.nextUrl = new URL(url);
    this.headers = new Map(Object.entries(options.headers || {}));
    this.searchParams = new URLSearchParams(new URL(url).search);
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

// Mock NextResponse
class MockNextResponse {
  constructor(data, status = 200) {
    this.data = data;
    this.status = status;
  }

  static json(data, options = {}) {
    return {
      status: options.status || 200,
      data,
      json: () => Promise.resolve(data)
    };
  }
}

global.NextRequest = MockNextRequest;
global.NextResponse = MockNextResponse;

describe('Contest Results API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/contest-results', () => {
    it('should return all contest results when no filters are provided', async () => {
      // Mock the prisma query results
      const mockContestResults = [
        { 
          id: '1', 
          place: 1,
          contest_id: '1',
          contest_name: 'Contest A',
          player_id: '1',
          player_name: 'John Doe',
          team_id: '1',
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          place: 2,
          contest_id: '1',
          contest_name: 'Contest A',
          player_id: '2',
          player_name: 'Jane Smith',
          team_id: '1',
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockContestResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockContestResults);
    });

    it('should return contest results for a specific contest', async () => {
      // Mock the prisma query results
      const mockContestResults = [
        { 
          id: '1', 
          place: 1,
          contest_id: '1',
          contest_name: 'Contest A',
          player_id: '1',
          player_name: 'John Doe',
          team_id: '1',
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          place: 2,
          contest_id: '1',
          contest_name: 'Contest A',
          player_id: '2',
          player_name: 'Jane Smith',
          team_id: '1',
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockContestResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results?contestId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockContestResults);
    });

    it('should return contest results for a specific player', async () => {
      // Mock the prisma query results
      const mockContestResults = [
        { 
          id: '1', 
          place: 1,
          contest_id: '1',
          contest_name: 'Contest A',
          player_id: '1',
          player_name: 'John Doe',
          team_id: '1',
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockContestResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results?playerId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockContestResults);
    });

    it('should handle errors', async () => {
      // Mock the prisma query to throw an error
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch contest results' });
    });
  });

  describe('POST /api/contest-results', () => {
    it('should create a new contest result', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { 
        contestId: '1',
        playerId: '1',
        result: 1  // Changed from place to result
      };

      // Mock the prisma query results for contest check
      const contests = [{ 
        id: '1', 
        name: 'Contest A',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(contests);  // Contest exists
      
      // Mock the prisma query results for player check
      const players = [{ 
        id: '1', 
        name: 'John Doe',
        team_id: '1',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(players);  // Player exists
      
      // Mock the prisma query for existence check (no existing results)
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      const newContestResult = [{ 
        id: '1', 
        result: 1,  // Changed from place to result
        contest_id: '1',
        player_id: '1',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(newContestResult);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that auth was called
      expect(auth).toHaveBeenCalledTimes(1);

      // Verify that prisma.$queryRaw was called for each check and creation
      expect(prisma.$queryRaw).toHaveBeenCalled();

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual(newContestResult[0]);
    });

    it('should return 401 if not authenticated', async () => {
      // Mock the auth function to return no userId
      auth.mockResolvedValueOnce({ userId: null });

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contestId: '1', playerId: '1', result: 1 }),
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that auth was called
      expect(auth).toHaveBeenCalledTimes(1);

      // Verify that prisma.$queryRaw was not called
      expect(prisma.$queryRaw).not.toHaveBeenCalled();

      // Verify the response
      expect(response.status).toBe(401);
      expect(responseData).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if missing required fields', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Create a mock request with missing required fields
      const req = new MockNextRequest('http://localhost:3000/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ }),  // Missing all required fields
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that auth was called
      expect(auth).toHaveBeenCalledTimes(1);

      // Verify that prisma.$queryRaw was not called
      expect(prisma.$queryRaw).not.toHaveBeenCalled();

      // Verify the response matches the API implementation
      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields: contestId, playerId, and result' });
    });

    it('should return 404 if contest not found', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { contestId: '1', playerId: '1', result: 1 };

      // Mock the prisma query results to indicate contest doesn't exist
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that auth was called
      expect(auth).toHaveBeenCalledTimes(1);

      // Verify that prisma.$queryRaw was called for the contest check
      expect(prisma.$queryRaw).toHaveBeenCalled();

      // Verify the response
      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Contest not found' });
    });

    it('should return 404 if player not found', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { contestId: '1', playerId: '1', result: 1 };

      // Mock the prisma query results for contest check
      const contests = [{ 
        id: '1', 
        name: 'Contest A',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(contests);  // Contest exists
      
      // Mock the prisma query results to indicate player doesn't exist
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that auth was called
      expect(auth).toHaveBeenCalledTimes(1);

      // Verify that prisma.$queryRaw was called for each check
      expect(prisma.$queryRaw).toHaveBeenCalled();

      // Verify the response
      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Player not found' });
    });

    it('should return 409 if contest result already exists', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { contestId: '1', playerId: '1', result: 1 };

      // Mock the prisma query results for contest check
      const contests = [{ 
        id: '1', 
        name: 'Contest A',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(contests);  // Contest exists
      
      // Mock the prisma query results for player check
      const players = [{ 
        id: '1', 
        name: 'John Doe',
        team_id: '1',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(players);  // Player exists
      
      // Mock the prisma query for existence check (existing results)
      const existingResults = [{ 
        id: '1', 
        result: 2,
        contest_id: '1',
        player_id: '1',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(existingResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that auth was called
      expect(auth).toHaveBeenCalledTimes(1);

      // Verify that prisma.$queryRaw was called for each check
      expect(prisma.$queryRaw).toHaveBeenCalled();

      // Verify the response
      expect(response.status).toBe(409);
      expect(responseData).toEqual({ error: 'Contest result already exists for this player and contest' });
    });

    it('should handle errors during creation', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { contestId: '1', playerId: '1', result: 1 };

      // Mock the prisma query for contest check
      const contests = [{ 
        id: '1', 
        name: 'Contest A',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(contests);
      
      // Mock the prisma query for player check
      const players = [{ 
        id: '1', 
        name: 'John Doe',
        team_id: '1',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(players);
      
      // Mock the prisma query for existence check (no existing results)
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      // Mock the prisma query to throw an error during creation
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/contest-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called for each check and creation attempt
      expect(prisma.$queryRaw).toHaveBeenCalled();

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create contest result' });
    });
  });
}); 