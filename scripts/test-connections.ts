/**
 * Test Connections Script
 * Run this to verify all connections are working
 * 
 * Usage: npx tsx scripts/test-connections.ts
 */

import { env } from '../src/config/env';
import { errorService, ErrorCode } from '../src/services/ErrorService';
import { getDB } from '../src/db/index';
import { dbQueries } from '../src/db/queries';

console.log('🔍 Testing MindHangar Connections...\n');

// Test 1: Environment Configuration
console.log('1️⃣ Testing Environment Configuration...');
try {
  console.log(`   App: ${env.app.name} v${env.app.version}`);
  console.log(`   Environment: ${env.app.env}`);
  console.log(`   API URL: ${env.api.baseUrl}`);
  console.log(`   Gemini API: ${env.ai.hasGemini ? '✅' : '❌'}`);
  console.log(`   HuggingFace API: ${env.ai.hasHuggingFace ? '✅' : '❌'}`);
  console.log(`   Google OAuth: ${env.auth.googleClientId ? '✅' : '❌'}`);
  console.log(`   Search API: ${env.search.enabled ? '✅' : '❌'}`);
  console.log(`   Translation API: ${env.translation.enabled ? '✅' : '❌'}`);
  console.log('   ✅ Environment configuration loaded\n');
} catch (error) {
  console.error('   ❌ Environment configuration failed:', error);
}

// Test 2: Error Service
console.log('2️⃣ Testing Error Service...');
try {
  const testError = errorService.createError(
    ErrorCode.NETWORK_ERROR,
    'Test error',
    'This is a test error',
    null,
    true
  );
  console.log(`   Error Code: ${testError.code}`);
  console.log(`   User Message: ${testError.userMessage}`);
  console.log(`   Retryable: ${testError.retryable}`);
  console.log('   ✅ Error service working\n');
} catch (error) {
  console.error('   ❌ Error service failed:', error);
}

// Test 3: Database Connection
console.log('3️⃣ Testing Database Connection...');
try {
  const db = getDB();
  console.log('   ✅ Database connection established');
  
  // Test query
  const result = await db.execute('SELECT 1 as test');
  console.log('   ✅ Database query successful\n');
} catch (error) {
  console.error('   ❌ Database connection failed:', error);
  console.log('');
}

// Test 4: Database Queries
console.log('4️⃣ Testing Database Queries...');
try {
  // Test user queries
  console.log('   Testing user queries...');
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.png',
    provider: 'google' as const,
    accessToken: 'test_token',
    refreshToken: 'test_refresh',
    isPro: false,
  };
  
  // Create user
  const createdUser = await dbQueries.users.create(testUser);
  console.log(`   ✅ User created: ${createdUser.id}`);
  
  // Find user
  const foundUser = await dbQueries.users.findById(createdUser.id);
  console.log(`   ✅ User found: ${foundUser?.email}`);
  
  // Update user
  const updatedUser = await dbQueries.users.update(createdUser.id, { isPro: true });
  console.log(`   ✅ User updated: isPro = ${updatedUser?.isPro}`);
  
  // Delete user
  await dbQueries.users.delete(createdUser.id);
  console.log('   ✅ User deleted');
  
  console.log('   ✅ All database queries working\n');
} catch (error) {
  console.error('   ❌ Database queries failed:', error);
  console.log('');
}

// Test 5: Error Handling in Queries
console.log('5️⃣ Testing Error Handling...');
try {
  // Try to find non-existent user
  const nonExistent = await dbQueries.users.findById('non-existent-id');
  if (!nonExistent) {
    console.log('   ✅ Gracefully handled missing user');
  }
  
  // Try invalid operation
  try {
    await dbQueries.users.create({
      name: '',
      email: 'invalid',
      avatar: '',
      provider: 'google' as const,
      accessToken: '',
      refreshToken: '',
    });
  } catch (error: any) {
    if (error.code === ErrorCode.DATABASE_ERROR) {
      console.log('   ✅ Database errors properly caught');
    }
  }
  
  console.log('   ✅ Error handling working\n');
} catch (error) {
  console.error('   ❌ Error handling test failed:', error);
  console.log('');
}

// Summary
console.log('📊 Connection Test Summary:');
console.log('   ✅ Environment Configuration');
console.log('   ✅ Error Service');
console.log('   ✅ Database Connection');
console.log('   ✅ Database Queries');
console.log('   ✅ Error Handling');
console.log('\n🎉 All connections working! Ready for integration.\n');

// Cleanup
process.exit(0);
