const { GET, POST } = require('../../../app/api/flights/route');
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

describe('Flights API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/flights', () => {
    it('should return all flights when no tournamentYearId is provided', async () => {
      // Mock the prisma query results
      const mockFlights = [
        { 
          id: '1', 
          name: 'Flight A', 
          tournament_year_id: '1', 
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Flight B', 
          tournament_year_id: '1', 
          year: 2024, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockFlights);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/flights');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockFlights);
    });

    it('should return flights for a specific tournament year', async () => {
      // Mock the prisma query results
      const mockFlights = [
        { 
          id: '1', 
          name: 'Flight A', 
          tournament_year_id: '1', 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Flight B', 
          tournament_year_id: '1', 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        },
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockFlights);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/flights?tournamentYearId=1');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockFlights);
    });

    it('should handle errors', async () => {
      // Mock the prisma query to throw an error
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/flights');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch flights' });
    });
  });

  describe('POST /api/flights', () => {
    it('should create a new flight', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'Flight C', tournamentYearId: '1' };

      // Mock the prisma query results
      const tournamentYears = [{ 
        id: '1', 
        year: 2024, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(tournamentYears);  // Tournament year exists
      
      const newFlight = [{ 
        id: '3', 
        name: 'Flight C', 
        tournament_year_id: '1', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(newFlight);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/flights', {
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
      expect(responseData).toEqual(newFlight[0]);
    });

    it('should return 401 if not authenticated', async () => {
      // Mock the auth function to return no userId
      auth.mockResolvedValueOnce({ userId: null });

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Flight C', tournamentYearId: '1' }),
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
      const req = new MockNextRequest('http://localhost:3000/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Flight C' }),  // Missing tournamentYearId
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
      expect(responseData).toEqual({ error: 'Missing required fields: name and tournamentYearId' });
    });

    it('should return 404 if tournament year not found', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'Flight C', tournamentYearId: '1' };

      // Mock the prisma query results to indicate tournament year doesn't exist
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/flights', {
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
      expect(responseData).toEqual({ error: 'Tournament year not found' });
    });

    it('should handle errors during creation', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { name: 'Flight C', tournamentYearId: '1' };

      // Mock the prisma query results for the existence check
      const tournamentYears = [{ 
        id: '1', 
        year: 2024, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }];
      prisma.$queryRaw.mockResolvedValueOnce(tournamentYears);

      // Mock the prisma query to throw an error during creation
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/flights', {
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
      expect(responseData).toEqual({ error: 'Failed to create flight' });
    });
  });
}); 