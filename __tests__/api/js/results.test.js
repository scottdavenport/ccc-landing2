const { GET, POST } = require('../../../app/api/results/route');
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

describe('Results API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/results', () => {
    it('should return all results when no filters are provided', async () => {
      // Mock the prisma query results
      const mockResults = [
        { 
          id: '1', 
          team_id: '1',
          team_name: 'Team A', 
          flight_name: 'Flight A', 
          position: 1,
          score: 72.5,
          purse: 1000,
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          team_id: '2',
          team_name: 'Team B', 
          flight_name: 'Flight A', 
          position: 2,
          score: 74.0,
          purse: 500,
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResults);
    });

    it('should return results for a specific team', async () => {
      // Mock the prisma query results
      const mockResults = [
        { 
          id: '1', 
          team_id: '1',
          team_name: 'Team A', 
          flight_name: 'Flight A', 
          position: 1,
          score: 72.5,
          purse: 1000,
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results?teamId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResults);
    });

    it('should return results for a specific flight', async () => {
      // Mock the prisma query results
      const mockResults = [
        { 
          id: '1', 
          team_id: '1',
          team_name: 'Team A', 
          flight_name: 'Flight A', 
          position: 1,
          score: 72.5,
          purse: 1000,
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          team_id: '2',
          team_name: 'Team B', 
          flight_name: 'Flight A', 
          position: 2,
          score: 74.0,
          purse: 500,
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results?flightId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResults);
    });

    it('should return results for a specific tournament year', async () => {
      // Mock the prisma query results
      const mockResults = [
        { 
          id: '1', 
          team_id: '1',
          team_name: 'Team A', 
          flight_name: 'Flight A', 
          position: 1,
          score: 72.5,
          purse: 1000,
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          team_id: '2',
          team_name: 'Team B', 
          flight_name: 'Flight A', 
          position: 2,
          score: 74.0,
          purse: 500,
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results?tournamentYearId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResults);
    });

    it('should handle errors', async () => {
      // Mock the prisma query to throw an error
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch results' });
    });
  });

  describe('POST /api/results', () => {
    it('should create a new result', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { 
        teamId: '1', 
        position: 1, 
        score: 72.5,
        purse: 1000
      };

      // Mock the prisma query results
      const teams = [{ 
        id: '1', 
        name: 'Team A', 
        flight_id: '1', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(teams);  // Team exists

      // No existing results
      prisma.$queryRaw.mockResolvedValueOnce([]);
      
      const newResult = [{ 
        id: '1', 
        team_id: '1',
        position: 1,
        score: 72.5,
        purse: 1000,
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(newResult);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results', {
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

      // Verify that prisma.$queryRaw was called for existence check and creation
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(3);

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual(newResult[0]);
    });

    it('should return 401 if not authenticated', async () => {
      // Mock the auth function to return no userId
      auth.mockResolvedValueOnce({ userId: null });

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: '1', position: 1, score: 72.5 }),
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

      // Create a mock request with missing fields
      const req = new MockNextRequest('http://localhost:3000/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: '1' }),  // Missing position and score
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that auth was called
      expect(auth).toHaveBeenCalledTimes(1);

      // Verify that prisma.$queryRaw was not called
      expect(prisma.$queryRaw).not.toHaveBeenCalled();

      // Verify the response
      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing required fields: teamId, position, and score' });
    });

    it('should return 404 if team not found', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { teamId: '1', position: 1, score: 72.5 };

      // Mock the prisma query results to indicate team doesn't exist
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results', {
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

      // Verify that prisma.$queryRaw was called once for the existence check
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(404);
      expect(responseData).toEqual({ error: 'Team not found' });
    });

    it('should return 409 if result already exists for team', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { teamId: '1', position: 1, score: 72.5 };

      // Mock the prisma query results
      const teams = [{ 
        id: '1', 
        name: 'Team A', 
        flight_id: '1', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(teams);  // Team exists

      // Existing result
      const existingResults = [{ 
        id: '1', 
        team_id: '1',
        position: 1,
        score: 72.5,
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(existingResults);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results', {
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

      // Verify that prisma.$queryRaw was called twice for the existence checks
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);

      // Verify the response
      expect(response.status).toBe(409);
      expect(responseData).toEqual({ error: 'Result already exists for this team' });
    });

    it('should handle errors during creation', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { teamId: '1', position: 1, score: 72.5 };

      // Mock the prisma query results
      const teams = [{ 
        id: '1', 
        name: 'Team A', 
        flight_id: '1', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(teams);  // Team exists

      // No existing results
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Mock the prisma query to throw an error during creation
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Call the POST function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(3);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create result' });
    });
  });
}); 