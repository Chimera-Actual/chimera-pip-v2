# PipBoy Dashboard - Retro-Futuristic React App

A Fallout-inspired dashboard application built with React, TypeScript, and Supabase, featuring modular widgets, theme customization, and real-time functionality.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Required - Supabase Configuration
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
   
   # Optional - Analytics & Monitoring
   VITE_SENTRY_DSN=your_sentry_dsn
   VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
   
   # Optional - Feature Flags
   VITE_ENABLE_PWA=true
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_ERROR_TRACKING=true
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🛠️ Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development environment |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run TypeScript type checking |
| `npx vitest run` | Run tests once |
| `npx vitest` | Run tests in watch mode |
| `npx vitest run --coverage` | Run tests with coverage report |

## 🧪 Testing

### Running Tests

```bash
# Run all tests once
npx vitest run

# Run tests in watch mode during development
npx vitest

# Generate coverage report
npx vitest run --coverage
```

### Test Structure

- **Unit Tests**: Component and utility function tests in `src/**/__tests__/`
- **Integration Tests**: End-to-end workflow tests in `src/test/integration/`
- **Test Setup**: Global test configuration in `src/test/setup.ts`

### Writing Tests

- Use Vitest for test runner and assertions
- Use React Testing Library for component testing
- Mock Supabase client in tests using the established patterns
- Follow the test file naming convention: `*.test.ts` or `*.test.tsx`

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Real-time)
- **State Management**: React Query (TanStack Query)
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint with TypeScript and React plugins

### Key Features

- 🎮 **Retro-Futuristic UI**: Fallout Pip-Boy inspired design system
- 📱 **PWA Support**: Installable web app with offline capabilities
- 🔐 **Authentication**: Supabase auth with custom character creation
- 📊 **Modular Widgets**: Weather, clock, AI chat, and more
- 🎨 **Theme System**: Multiple color schemes and visual effects
- ⚡ **Real-time Updates**: Live data synchronization
- ♿ **Accessibility**: WCAG compliant with keyboard navigation
- 🧪 **Comprehensive Testing**: Unit and integration test coverage

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── PipBoy/         # Main dashboard components
│   ├── widgets/        # Modular widget components
│   ├── auth/           # Authentication components
│   └── ui/             # shadcn/ui base components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
├── test/               # Test utilities and integration tests
└── contexts/           # React context providers
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | - |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics measurement ID | - |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_ENABLE_PWA` | Enable PWA features | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `true` |
| `VITE_ENABLE_ERROR_TRACKING` | Enable error reporting | `true` |

## 🚢 Deployment

### Lovable Platform

Simply open [Lovable](https://lovable.dev/projects/22cfdae1-0a72-4e7b-bb39-19805adfa91d) and click on Share → Publish.

### Self-Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting platform:
   - Vercel: Connect your GitHub repo
   - Netlify: Drag and drop the `dist` folder
   - AWS S3: Upload to S3 bucket with static hosting
   - Docker: Use the included Dockerfile

3. **Configure environment variables** in your hosting platform's dashboard

### Docker Deployment

```bash
# Build Docker image
docker build -t pipboy-dashboard .

# Run container
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  pipboy-dashboard
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and ensure tests pass: `npx vitest run`
4. Run quality checks: `npm run lint && npx tsc --noEmit`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Workflow

- All PRs must pass CI checks (type-check, lint, test, build)
- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

## 📝 License

This project is built with [Lovable](https://lovable.dev) and follows their terms of service.

## 🆘 Support

- **Lovable Platform**: Visit your [project dashboard](https://lovable.dev/projects/22cfdae1-0a72-4e7b-bb39-19805adfa91d)
- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Open an issue on GitHub for bugs or feature requests

## 🎮 Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains in Lovable
2. Click Connect Domain
3. Follow the [custom domain setup guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)