
import { User, AuthProvider } from '../types';

// Mock Service mimicking a backend OAuth flow
// In production, this would redirect to `${API_URL}/auth/${provider}`
// and handle the callback with token exchange.

const MOCK_DELAY = 1500;

const mockUsers: Record<string, Partial<User>> = {
  google: {
    name: 'Alex Student',
    email: 'alex.student@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  github: {
    name: 'Dev Scholar',
    email: 'dev@github.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev',
  }
};

export const authService = {
  login: async (provider: AuthProvider): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    // Simulate random failure occasionally? No, let's keep it reliable for demo.
    
    const mockUser = mockUsers[provider] || mockUsers['google'];
    
    return {
      id: `${provider}_${crypto.randomUUID().slice(0, 8)}`,
      name: mockUser.name!,
      email: mockUser.email!,
      avatar: mockUser.avatar!,
      provider,
      joinedAt: new Date(),
      accessToken: `mock_${provider}_access_token_${Date.now()}`,
      refreshToken: `mock_${provider}_refresh_token`,
    };
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
