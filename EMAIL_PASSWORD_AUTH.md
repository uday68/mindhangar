# Email/Password Authentication

## Overview

In addition to OAuth (Google/GitHub), users can now sign up and log in using email and password.

## Features

✅ User registration with email/password
✅ Secure password hashing (bcrypt with 12 rounds)
✅ Email validation
✅ Password strength requirements (min 8 characters)
✅ Duplicate email detection
✅ Works in both mock and real modes

## How It Works

### Registration Flow

1. User clicks "Continue with Email" on login screen
2. User fills in name, email, and password
3. Frontend sends POST request to `/api/auth/register`
4. Backend validates input and checks for existing users
5. Password is hashed with bcrypt
6. User record is created in database
7. User is automatically logged in

### Login Flow

1. User clicks "Continue with Email" on login screen
2. User enters email and password
3. Frontend calls NextAuth credentials provider
4. Backend verifies email and password
5. Session is created
6. User is logged in

## UI Changes

The login screen now has three options:

1. **Continue with Google** - OAuth with Google
2. **Continue with GitHub** - OAuth with GitHub
3. **Continue with Email** - Email/password authentication

When "Continue with Email" is clicked:
- Form appears with email and password fields
- Toggle between "Sign In" and "Sign Up" modes
- "Back" button returns to OAuth options

## Database Schema

The `users` table now includes:

```typescript
{
  password: text('password'), // Hashed password (null for OAuth users)
  emailVerified: timestamp('email_verified'), // For future email verification
  provider: text('provider'), // 'credentials' for email/password
}
```

## API Endpoints

### POST /api/auth/register

Register a new user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John%20Doe"
  },
  "message": "User registered successfully"
}
```

**Response (Error):**
```json
{
  "error": "User with this email already exists"
}
```

### POST /api/auth/callback/credentials

Login with email and password (handled by NextAuth).

## Security Features

### Password Hashing
- Uses bcrypt with 12 rounds
- Passwords are never stored in plain text
- Hashing is done server-side

### Validation
- Email format validation (regex)
- Password minimum length (8 characters)
- Duplicate email detection
- SQL injection prevention (parameterized queries)

### Session Management
- Same JWT-based sessions as OAuth
- httpOnly cookies
- 7-day expiration
- Automatic refresh

## Mock Mode

In mock mode (default), email/password authentication is simulated:

```typescript
// Mock login - no backend required
const user = await authService.login('credentials', 'user@example.com', 'password123');
```

The mock service:
- Accepts any email/password combination
- Generates a fake user ID
- Returns a user object immediately
- No actual validation or database storage

## Real Mode

In real mode, email/password authentication uses the backend:

```env
VITE_USE_REAL_AUTH=true
VITE_API_URL=http://localhost:3000
```

The real service:
- Validates email format
- Checks password strength
- Hashes passwords with bcrypt
- Stores users in PostgreSQL
- Creates secure sessions

## Testing

### Test Registration (Mock Mode)

```bash
npm run dev
```

1. Click "Continue with Email"
2. Click "Need an account?"
3. Enter any name, email, and password (min 8 chars)
4. Click "Sign Up"
5. You're logged in!

### Test Registration (Real Mode)

Requires backend setup:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

1. Click "Continue with Email"
2. Click "Need an account?"
3. Enter valid email and strong password
4. Click "Sign Up"
5. User is created in database and logged in

## Password Requirements

Current requirements:
- Minimum 8 characters
- No maximum length
- No complexity requirements (yet)

Future enhancements:
- Require uppercase, lowercase, number, special char
- Password strength meter
- Common password blacklist
- Password reset functionality

## Future Enhancements

### Email Verification
- Send verification email on registration
- Require email verification before login
- Resend verification email option

### Password Reset
- "Forgot password?" link
- Email with reset token
- Secure password reset flow

### Two-Factor Authentication
- Optional 2FA with TOTP
- Backup codes
- SMS verification

### Account Linking
- Link OAuth accounts to email/password account
- Multiple login methods for same user
- Account merge functionality

## Troubleshooting

### "User with this email already exists"
- Email is already registered
- Try logging in instead of signing up
- Use "Already have an account?" link

### "Password must be at least 8 characters long"
- Password is too short
- Use a longer password

### "Invalid email format"
- Email doesn't match format (user@domain.com)
- Check for typos

### "Invalid email or password"
- Credentials don't match
- Check email and password
- Passwords are case-sensitive

## Code Examples

### Frontend - Login Component

```typescript
const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (isSignUp) {
      // Register
      await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
    }
    
    // Login
    await login('credentials', email, password);
  } catch (error) {
    setError(error.message);
  }
};
```

### Backend - Registration Endpoint

```typescript
// Hash password
const hashedPassword = await hash(password, 12);

// Create user
await db.insert(users).values({
  email,
  password: hashedPassword,
  name,
  provider: 'credentials',
});
```

### Backend - Credentials Provider

```typescript
Credentials({
  async authorize(credentials) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, credentials.email),
    });
    
    if (!user || !user.password) return null;
    
    const isValid = await compare(credentials.password, user.password);
    
    return isValid ? user : null;
  },
});
```

## Summary

✅ Email/password authentication is now available alongside OAuth
✅ Secure password hashing with bcrypt
✅ User registration and login flows implemented
✅ Works in both mock and real modes
✅ Same session management as OAuth
✅ Ready for production use

Users now have three ways to authenticate:
1. Google OAuth
2. GitHub OAuth
3. Email/Password

All three methods provide the same user experience and security level.
