// This file runs before each test file
// You can add global setup logic here

// Suppress console.error outputs during tests
global.console.error = jest.fn();

// Mock the NextRequest class since it's not available in Node.js environment
class MockNextRequest {
  constructor(input, init = {}) {
    this.url = input;
    this.headers = new Headers(init.headers || {});
    this.method = init.method || 'GET';
    this.body = init.body || null;
    this.nextUrl = new URL(input);
  }

  json() {
    if (this.body && typeof this.body === 'object') {
      return Promise.resolve(this.body);
    }
    return Promise.resolve({});
  }
}

global.NextRequest = MockNextRequest;

// Mock the NextResponse class since it's not available in Node.js environment
class MockNextResponse {
  static json(data, init = {}) {
    return {
      status: init.status || 200,
      data,
      headers: new Headers(init.headers || {}),
      json: () => Promise.resolve(data)
    };
  }
}

global.NextResponse = MockNextResponse;

// Mock Jest types for TypeScript
jest.mock('@clerk/nextjs/server', () => {
  return {
    auth: jest.fn().mockResolvedValue({ userId: 'test-user-id' })
  };
});

// Mock the Prisma client with properly typed Mock
jest.mock('@/lib/prisma', () => {
  return {
    prisma: {
      $queryRaw: jest.fn().mockImplementation((...args) => {
        const fn = jest.fn();
        fn.mock = { calls: [[args[0]]] };
        return Promise.resolve([]);
      })
    }
  };
}); 