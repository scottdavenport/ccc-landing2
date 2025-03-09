const { GET, POST } = require('../../../app/api/teams/route');
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

describe('Teams API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/teams', () => {
    it('should return all teams when no flightId is provided', async () => {
      // Mock the prisma query results
      const mockTeams = [
        { 
          id: '1', 
          name: 'Team A', 
          flight_id: '1', 
          flight_name: 'Flight A', 
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Team B', 
          flight_id: '1', 
          flight_name: 'Flight A', 
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockTeams);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/teams');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockTeams);
    });

    it('should return teams for a specific flight', async () => {
      // Mock the prisma query results
      const mockTeams = [
        { 
          id: '1', 
          name: 'Team A', 
          flight_id: '1', 
          flight_name: 'Flight A', 
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Team B', 
          flight_id: '1', 
          flight_name: 'Flight A', 
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockTeams);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/teams?flightId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockTeams);
    });

    it('should handle errors', async () => {
      // Mock the prisma query to throw an error
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/teams');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch teams' });
    });
  });

  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'Team C', flightId: '1' };

      // Mock the prisma query results
      const flights = [{ 
        id: '1', 
        name: 'Flight A', 
        tournament_year_id: '1', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(flights);  // Flight exists
      
      const newTeam = [{ 
        id: '3', 
        name: 'Team C', 
        flight_id: '1', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(newTeam);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/teams', {
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
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual(newTeam[0]);
    });

    it('should return 401 if not authenticated', async () => {
      // Mock the auth function to return no userId
      auth.mockResolvedValueOnce({ userId: null });

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Team C', flightId: '1' }),
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
      const req = new MockNextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Team C' }),  // Missing flightId
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
      expect(responseData).toEqual({ error: 'Missing required fields: name and flightId' });
    });

    it('should return 404 if flight not found', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'Team C', flightId: '1' };

      // Mock the prisma query results to indicate flight doesn't exist
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/teams', {
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
      expect(responseData).toEqual({ error: 'Flight not found' });
    });

    it('should handle errors during creation', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'Team C', flightId: '1' };

      // Mock the prisma query results for the existence check
      const flights = [{ 
        id: '1', 
        name: 'Flight A', 
        tournament_year_id: '1', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(flights);

      // Mock the prisma query to throw an error during creation
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/teams', {
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
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create team' });
    });
  });
}); 