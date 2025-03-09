const { GET, POST } = require('../../../app/api/players/route');
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

describe('Players API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/players', () => {
    it('should return all players when no teamId is provided', async () => {
      // Mock the prisma query results
      const mockPlayers = [
        { 
          id: '1', 
          name: 'John Doe', 
          team_id: '1', 
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Jane Smith', 
          team_id: '1', 
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '3', 
          name: 'Bob Johnson', 
          team_id: null, 
          team_name: null,
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockPlayers);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockPlayers);
    });

    it('should return players for a specific team', async () => {
      // Mock the prisma query results
      const mockPlayers = [
        { 
          id: '1', 
          name: 'John Doe', 
          team_id: '1', 
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Jane Smith', 
          team_id: '1', 
          team_name: 'Team A',
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockPlayers);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players?teamId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockPlayers);
    });

    it('should handle errors', async () => {
      // Mock the prisma query to throw an error
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch players' });
    });
  });

  describe('POST /api/players', () => {
    it('should create a new player without team', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body - player without team
      const requestBody = { 
        name: 'Bob Johnson'
      };
      
      const newPlayer = [{ 
        id: '3', 
        name: 'Bob Johnson', 
        team_id: null,
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(newPlayer);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players', {
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

      // Verify that prisma.$queryRaw was called for creation
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual(newPlayer[0]);
    });

    it('should create a new player with team', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body - player with team
      const requestBody = { 
        name: 'John Doe',
        teamId: '1'
      };

      // Mock the prisma query results for team check
      const teams = [{ 
        id: '1', 
        name: 'Team A',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(teams);  // Team exists
      
      const newPlayer = [{ 
        id: '1', 
        name: 'John Doe', 
        team_id: '1',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(newPlayer);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players', {
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

      // Verify that prisma.$queryRaw was called for team check and creation
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual(newPlayer[0]);
    });

    it('should return 401 if not authenticated', async () => {
      // Mock the auth function to return no userId
      auth.mockResolvedValueOnce({ userId: null });

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'John Doe' }),
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

    it('should return 400 if missing name', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Create a mock request with missing name
      const req = new MockNextRequest('http://localhost:3000/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: '1' }),  // Missing name
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
      expect(responseData).toEqual({ error: 'Missing required field: name' });
    });

    it('should return 404 if team not found', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'John Doe', teamId: '1' };

      // Mock the prisma query results to indicate team doesn't exist
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players', {
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

    it('should handle errors during creation', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'John Doe' };

      // Mock the prisma query to throw an error during creation
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/players', {
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
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create player' });
    });
  });
}); 