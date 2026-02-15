# Contributing to MindHangar AI for Bharat

Welcome! We're excited that you want to contribute to MindHangar AI for Bharat - an AI-powered educational platform designed for Indian students.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Getting Help](#getting-help)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **PostgreSQL** (optional, for backend development) - [Download](https://www.postgresql.org/)

### Quick Start

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mindhangar.git
   cd mindhangar
   ```

3. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   # Frontend
   cp .env.example .env
   
   # Backend
   cp backend/.env.example backend/.env.local
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend (optional)
   cd backend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 🛠️ Development Setup

### Frontend Setup

The frontend is a React + TypeScript + Vite application.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run linter
npm run lint
```

### Backend Setup

The backend is a Next.js 15 application with PostgreSQL database.

```bash
cd backend

# Install dependencies
npm install

# Set up database (choose one option)

# Option 1: Use Supabase (Recommended)
# 1. Go to https://supabase.com
# 2. Create a new project
# 3. Copy the connection string
# 4. Add to backend/.env.local:
#    DATABASE_URL=postgresql://...

# Option 2: Use local PostgreSQL
# 1. Install PostgreSQL
# 2. Create database: createdb mindhangar
# 3. Add to backend/.env.local:
#    DATABASE_URL=postgresql://postgres:password@localhost:5432/mindhangar

# Generate database migrations
npm run db:generate

# Apply migrations to database
npm run db:push

# Start development server
npm run dev

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Environment Variables

#### Frontend (.env)

```env
# Required
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
VITE_USE_REAL_AUTH=false  # Set to 'true' to use real backend auth
```

#### Backend (backend/.env.local)

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# OAuth (Optional - for real authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 📁 Project Structure

```
mindhangar/
├── backend/                 # Next.js backend
│   ├── app/                # Next.js app directory
│   │   ├── api/           # API routes
│   │   └── auth/          # Auth pages
│   ├── lib/               # Backend utilities
│   │   ├── db/           # Database (Drizzle ORM)
│   │   └── utils/        # Helper functions
│   └── scripts/          # Database scripts
│
├── src/                    # Frontend source
│   ├── components/        # React components
│   │   ├── Auth/         # Authentication
│   │   ├── Panels/       # Main panels
│   │   ├── Modals/       # Modal dialogs
│   │   └── ...
│   ├── services/         # Business logic
│   │   ├── ai/          # AI models
│   │   ├── agents/      # AI agents
│   │   └── ...
│   ├── db/              # Frontend database (IndexedDB)
│   ├── i18n/            # Internationalization
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   └── styles/          # CSS files
│
├── store/                # Zustand state management
├── services/             # Shared services
├── docs/                 # Documentation
└── .kiro/               # Specs and configurations
```

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run tests
npm run test

# Test manually in browser
npm run dev

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add user profile editing feature"

# Or for bug fixes
git commit -m "fix: resolve login redirect issue"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUserProfile(userId: string): Promise<UserProfile> {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// Bad
export const Button = (props: any) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `LoginScreen.tsx`)
- Utilities: `camelCase.ts` (e.g., `authService.ts`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Constants: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

### Code Organization

- One component per file
- Group related files in folders
- Keep files under 300 lines
- Extract complex logic into separate files

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```typescript
// Example test file: Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Click me" onClick={() => {}} disabled />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

## 📤 Submitting Changes

### Pull Request Checklist

Before submitting a pull request, ensure:

- [ ] Code follows the coding standards
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linter errors
- [ ] Documentation is updated (if needed)
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Follows coding standards
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Try to reproduce the bug
3. Gather relevant information

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]

## Screenshots
Add screenshots if applicable

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Describe the feature clearly
3. Explain why it would be useful
4. Provide examples if possible

## 🌍 Internationalization (i18n)

### Adding a New Language

1. Create translation file:
   ```bash
   cp src/i18n/messages/en.json src/i18n/messages/[language-code].json
   ```

2. Translate all strings in the new file

3. Add language to supported languages:
   ```typescript
   // src/i18n/index.ts
   export const SUPPORTED_LANGUAGES = {
     // ... existing languages
     [code]: 'Language Name',
   };
   ```

4. Test the new language in the app

### Translation Guidelines

- Keep translations natural and culturally appropriate
- Maintain the same tone as English version
- Use placeholders for dynamic content: `{name}`
- Test with actual UI to ensure text fits

## 🎨 UI/UX Guidelines

- Follow the existing design system
- Ensure accessibility (WCAG 2.1 AA)
- Test on mobile devices
- Support offline functionality
- Optimize for low bandwidth

## 📚 Documentation

### Updating Documentation

- Keep README.md up to date
- Document new features
- Add code comments for complex logic
- Update API documentation

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots when helpful
- Keep formatting consistent

## 🤝 Getting Help

### Resources

- **Documentation**: Check the `docs/` folder
- **Issues**: Browse existing GitHub issues
- **Discussions**: Join GitHub Discussions

### Contact

- **Email**: support@mindhangar.in
- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions and ideas

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Thank You!

Thank you for contributing to MindHangar AI for Bharat! Your contributions help make education more accessible for millions of Indian students.

---

**Happy Coding!** 🚀
