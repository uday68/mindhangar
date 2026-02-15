#!/usr/bin/env node

/**
 * Setup script for MindHangar Backend
 * Helps generate secure keys and validate configuration
 */

import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('base64');
}

function generateEncryptionKey(): string {
  return randomBytes(32).toString('utf-8').substring(0, 32);
}

function setupEnvironment() {
  console.log('🚀 MindHangar Backend Setup\n');
  
  const envPath = join(process.cwd(), '.env.local');
  const envExamplePath = join(process.cwd(), '.env.example');
  
  // Check if .env.local already exists
  if (existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Skipping generation.');
    console.log('   Delete .env.local if you want to regenerate.\n');
    return;
  }
  
  // Read .env.example
  if (!existsSync(envExamplePath)) {
    console.error('❌ .env.example not found!');
    process.exit(1);
  }
  
  let envContent = readFileSync(envExamplePath, 'utf-8');
  
  // Generate secrets
  const nextAuthSecret = generateSecret(32);
  const jwtSigningKey = generateSecret(32);
  const encryptionKey = generateEncryptionKey();
  
  // Replace placeholders
  envContent = envContent
    .replace('your_secret_key_here_generate_with_openssl_rand_base64_32', nextAuthSecret)
    .replace('your_jwt_signing_key_here', jwtSigningKey)
    .replace('your_encryption_key_here_32_bytes', encryptionKey);
  
  // Write .env.local
  writeFileSync(envPath, envContent);
  
  console.log('✅ Generated .env.local with secure keys\n');
  console.log('📝 Next steps:');
  console.log('   1. Edit .env.local and add your database URL');
  console.log('   2. Add OAuth provider credentials (Google/GitHub)');
  console.log('   3. Run: npm run db:generate');
  console.log('   4. Run: npm run db:migrate');
  console.log('   5. Run: npm run dev\n');
  
  console.log('🔐 Generated secrets:');
  console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret.substring(0, 20)}...`);
  console.log(`   JWT_SIGNING_KEY: ${jwtSigningKey.substring(0, 20)}...`);
  console.log(`   ENCRYPTION_KEY: ${encryptionKey.substring(0, 20)}...\n`);
  
  console.log('⚠️  Keep these secrets secure and never commit them to git!\n');
}

// Run setup
setupEnvironment();
