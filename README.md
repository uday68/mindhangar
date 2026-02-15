# 🎓 MindHangar AI for Bharat

> An AI-powered educational platform designed specifically for Indian students, supporting 8+ Indian languages, cultural contexts, and competitive exam preparation.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)

## 🌟 Features

### 🌐 Multi-Language Support
- **8+ Indian Languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, English
- **Real-time Translation**: Content automatically translated to user's preferred language
- **Cultural Adaptation**: Examples and references adapted to regional contexts

### 📚 Educational Content
- **CBSE, ICSE, State Boards**: Aligned with major Indian educational boards
- **Competitive Exams**: JEE, NEET, UPSC preparation materials
- **YouTube Integration**: Curated educational videos
- **AI-Generated Courses**: Personalized learning paths

### 🤖 AI-Powered Features
- **Multi-Agent System**: Specialized AI agents for different tasks
  - Learning Coach Agent
  - Content Curator Agent
  - Course Creation Agent
- **Gemini AI Integration**: Advanced language understanding
- **Offline AI Models**: Works without internet using local models

### 📱 Offline-First Design
- **IndexedDB Storage**: Works completely offline
- **Progressive Web App (PWA)**: Install as mobile app
- **Low Bandwidth Mode**: Optimized for slow connections
- **Smart Caching**: Intelligent content prefetching

### 🎨 Modern UI/UX
- **Notion-like Interface**: Familiar, intuitive design
- **Drag-and-Drop Panels**: Customizable workspace
- **Dark/Light Mode**: Eye-friendly themes
- **Accessibility**: WCAG 2.1 AA compliant
- **Mobile Responsive**: Works on all devices

### 🔐 Authentication
- **OAuth**: Google and GitHub login
- **Email/Password**: Traditional authentication
- **Session Management**: Secure JWT tokens
- **Multi-device Sync**: Access from anywhere

## 🚀 Quick Start

### For Users

1. **Visit the app**: [https://mindhangar.in](https://mindhangar.in)
2. **Sign up**: Create an account or use OAuth
3. **Select preferences**: Choose language, board, grade
4. **Start learning**: Access courses, videos, and quizzes

### For Developers

```bash
# Clone the repository
git clone https://github.com/yourusername/mindhangar.git
cd mindhangar

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your API keys

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions.

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** (optional, for backend) ([Download](https://www.postgresql.org/))

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript 5.8** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **TailwindCSS** - Styling
- **IndexedDB** - Offline storage

### Backend
- **Next.js 15** - Server framework
- **NextAuth.js 5** - Authentication
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Zod** - Validation

### AI/ML
- **Google Gemini** - Language AI
- **Transformers.js** - Local AI models
- **HuggingFace** - Model hosting

## 📁 Project Structure

```
mindhangar/
├── backend/              # Next.js backend
│   ├── app/             # Next.js app directory
│   ├── lib/             # Backend utilities
│   └── scripts/         # Database scripts
│
├── src/                 # Frontend source
│   ├── components/      # React components
│   ├── services/        # Business logic
│   ├── db/             # IndexedDB database
│   ├── i18n/           # Translations
│   └── styles/         # CSS files
│
├── store/              # State management
├── docs/               # Documentation
└── .kiro/             # Specs
```

## 🔧 Development

### Frontend Development

```bash
# Start dev server
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

### Backend Development

```bash
cd backend

# Start dev server
npm run dev

# Database commands
npm run db:generate    # Generate migrations
npm run db:push        # Apply schema to DB
npm run db:studio      # Open database GUI

# Run tests
npm run test
```

### Environment Variables

#### Frontend (.env)
```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key
VITE_USE_REAL_AUTH=false
```

#### Backend (backend/.env.local)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

See [.env.example](.env.example) for all variables.

## 📚 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md)** - Database design
- **[BACKEND_DATABASE_SETUP.md](BACKEND_DATABASE_SETUP.md)** - Database setup
- **[AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)** - Authentication setup
- **[PRODUCTION_READINESS_AUDIT.md](PRODUCTION_READINESS_AUDIT.md)** - Production checklist
- **[docs/](docs/)** - Additional documentation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/components/Button.test.tsx
```

## 🌍 Internationalization

### Supported Languages

- 🇬🇧 English (en)
- 🇮🇳 Hindi (hi)
- 🇮🇳 Tamil (ta)
- 🇮🇳 Telugu (te)
- 🇮🇳 Bengali (bn)
- 🇮🇳 Marathi (mr)
- 🇮🇳 Gujarati (gu)
- 🇮🇳 Kannada (kn)

### Adding a New Language

1. Create translation file: `src/i18n/messages/[code].json`
2. Translate all strings
3. Add to `SUPPORTED_LANGUAGES` in `src/i18n/index.ts`
4. Test in the app

See [CONTRIBUTING.md](CONTRIBUTING.md#internationalization-i18n) for details.

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy

# Deploy to Netlify
netlify deploy --prod
```

### Backend (Vercel)

```bash
cd backend

# Deploy
vercel deploy
```

### Database (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations: `npm run db:push`

See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/yourusername/mindhangar/issues/new) with:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 💡 Feature Requests

Have an idea? We'd love to hear it! [Open an issue](https://github.com/yourusername/mindhangar/issues/new) with:

- Feature description
- Use case
- Why it would be useful
- Examples (if applicable)

## 📊 Project Status

### Current Version: 0.1.0 (Alpha)

### Roadmap

- [x] Multi-language support
- [x] Offline functionality
- [x] Authentication system
- [x] YouTube integration
- [x] AI agents
- [ ] Mobile app (React Native)
- [ ] Parent dashboard
- [ ] Teacher portal
- [ ] Government integration (DIKSHA, SWAYAM)
- [ ] Payment integration (Razorpay)
- [ ] Advanced analytics

See [docs/PRODUCTION_ROADMAP.md](docs/PRODUCTION_ROADMAP.md) for details.

## 🏆 Awards & Recognition

- **AWS AI for Bharat Hackathon** - Participant
- **Focus**: Educational technology for Indian students

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name](https://github.com/yourusername)
- **Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md)

## 🙏 Acknowledgments

- **Google Gemini** - AI language model
- **YouTube** - Educational content
- **Supabase** - Database hosting
- **Vercel** - Deployment platform
- **Open Source Community** - Amazing tools and libraries

## 📞 Contact

- **Email**: support@mindhangar.in
- **GitHub**: [github.com/yourusername/mindhangar](https://github.com/yourusername/mindhangar)
- **Website**: [mindhangar.in](https://mindhangar.in)

## 🌟 Star Us!

If you find this project useful, please give it a star ⭐ on GitHub!

---

**Made with ❤️ for Indian Students**

*Empowering education through AI and technology*
