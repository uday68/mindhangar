/**
 * Test setup file
 * Runs before all tests
 */

import { beforeAll, afterAll } from 'vitest';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(() => {
  // Setup test environment
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup after tests
  console.log('Cleaning up test environment...');
});
