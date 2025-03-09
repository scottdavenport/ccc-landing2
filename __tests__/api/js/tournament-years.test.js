const { GET, POST } = require('../../../app/api/tournament-years/route');
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

describe('Tournament Years API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tournament-years', () => {
    it('should return all tournament years', async () => {
      // Mock the prisma query results
      const mockTournamentYears = [
        { id: '1', year: 2024, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', year: 2023, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      prisma.$queryRaw.mockResolvedValueOnce(mockTournamentYears);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/tournament-years');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockTournamentYears);
    });

    it('should handle errors', async () => {
      // Mock the prisma query to throw an error
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/tournament-years');

      // Call the GET function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify that prisma.$queryRaw was called
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch tournament years' });
    });
  });

  describe('POST /api/tournament-years', () => {
    it('should create a new tournament year', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { year: 2025 };

      // Mock the prisma query results
      prisma.$queryRaw.mockResolvedValueOnce([]); // No existing year
      const newTournamentYear = [{ id: '3', year: 2025, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
      prisma.$queryRaw.mockResolvedValueOnce(newTournamentYear);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/tournament-years', {
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

      // Verify that prisma.$queryRaw was called for the existence check and creation
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual(newTournamentYear[0]);
    });

    it('should return 401 if not authenticated', async () => {
      // Mock the auth function to return no userId
      auth.mockResolvedValueOnce({ userId: null });

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/tournament-years', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: 2025 }),
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

    it('should return 400 if missing year', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Create a mock request with missing year
      const req = new MockNextRequest('http://localhost:3000/api/tournament-years', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
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
      expect(responseData).toEqual({ error: 'Invalid year provided' });
    });

    it('should return 409 if year already exists', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { year: 2025 };

      // Mock the prisma query results to indicate the year already exists
      const existingYears = [{ id: '3', year: 2025, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
      prisma.$queryRaw.mockResolvedValueOnce(existingYears);

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/tournament-years', {
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
      expect(response.status).toBe(409);
      expect(responseData).toEqual({ error: 'Tournament year already exists' });
    });

    it('should handle errors during creation', async () => {
      // Mock the auth function to return a userId
      auth.mockResolvedValueOnce({ userId: 'test-user-id' });

      // Mock the request body
      const requestBody = { year: 2025 };

      // Mock the prisma query results for the existence check
      prisma.$queryRaw.mockResolvedValueOnce([]);

      // Mock the prisma query to throw an error during creation
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      // Create a mock request
      const req = new MockNextRequest('http://localhost:3000/api/tournament-years', {
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
      expect(responseData).toEqual({ error: 'Failed to create tournament year' });
    });
  });
}); 