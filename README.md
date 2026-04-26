<!-- path: README.md -->
# Project Name

Production-ready monorepo application with NestJS backend and Next.js frontend.

## Architecture

- **Backend**: NestJS + PostgreSQL + Drizzle ORM + Redis
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Package Manager**: pnpm
- **Database**: PostgreSQL 16
- **Cache**: Redis 7

## Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x
- Docker & Docker Compose (for local development)

## Quick Start

### 1. Clone & Install
```bash
# Clone repository
git clone <repository-url>
cd <project-name>

# Install dependencies
pnpm install

### 2. Environment Setup

bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

Edit `.env` files with your configuration.

### 3. Start with Docker

bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

### 4. Database Setup

bash
# Generate migration
pnpm --filter backend db:generate

# Run migration
pnpm --filter backend db:migrate

# Seed database (optional)
pnpm --filter backend db:seed

## Development

### Without Docker

bash
# Start PostgreSQL & Redis
docker-compose up -d postgres redis

# Start backend
pnpm dev:backend

# Start frontend (in another terminal)
pnpm dev:frontend

### Available Scripts

bash
# Development
pnpm dev:backend          # Start backend in dev mode
pnpm dev:frontend         # Start frontend in dev mode

# Build
pnpm build                # Build all packages
pnpm build:backend        # Build backend only
pnpm build:frontend       # Build frontend only

# Linting & Formatting
pnpm lint                 # Lint all packages
pnpm lint:fix             # Fix linting issues
pnpm format               # Format code
pnpm format:check         # Check formatting

# Testing
pnpm test                 # Run all tests
pnpm test:backend         # Test backend
pnpm test:frontend        # Test frontend

# Database
pnpm --filter backend db:generate    # Generate migration
pnpm --filter backend db:migrate     # Run migrations
pnpm --filter backend db:studio      # Open Drizzle Studio
pnpm --filter backend db:seed        # Seed database

## Project Structure


.
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── shared/         # Shared utilities, DTOs, filters
│   │   ├── config/         # Configuration files
│   │   └── main.ts         # Application entry point
│   ├── drizzle/            # Database migrations
│   └── package.json
│
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & helpers
│   │   └── styles/        # Global styles
│   └── package.json
│
├── docker-compose.yml      # Docker services configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── package.json            # Root package.json

## API Documentation

Backend API documentation is available at:
- Development: http://localhost:3001/api/docs
- Swagger UI with interactive API testing

## Environment Variables

### Backend (.env)

env
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

### Frontend (.env)

env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

## Testing

bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

## Deployment

See [deployment documentation](./docs/08-deployment-runbook.md) for production deployment instructions.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development process.

## Documentation

- [Architecture Overview](./docs/02-solution-architecture.md)
- [Backend Architecture](./docs/03-backend-architecture.md)
- [Frontend Architecture](./docs/04-frontend-architecture.md)
- [API Standards](./docs/06-api-standards.md)
- [Security Baseline](./docs/07-security-baseline.md)
- [Testing Strategy](./docs/11-testing-strategy.md)

## License

[License Type] - See LICENSE file for details


```markdown
<!-- path: CONTRIBUTING.md -->
# Contributing Guide

Thank you for contributing to this project!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feature/your-feature`

## Development Workflow

### Code Standards

- Follow TypeScript strict mode
- Use ESLint and Prettier (configured in project)
- Write meaningful commit messages (see Commit Convention below)
- Add tests for new features
- Update documentation as needed

### Before Committing
```bash
# Run linting
pnpm lint:fix

# Run formatting
pnpm format

# Run tests
pnpm test

# Check types
pnpm --filter backend build
pnpm --filter frontend build

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):


<type>(<scope>): <subject>

<body>

<footer>

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

bash
feat(backend): add user authentication module

fix(frontend): resolve navigation menu overflow issue

docs: update API documentation for user endpoints

chore: upgrade dependencies to latest versions

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

### PR Title Format

Use the same convention as commits:


feat(backend): add email verification

## Code Review Guidelines

- Be respectful and constructive
- Focus on code quality and maintainability
- Suggest improvements with examples
- Approve when standards are met

## Testing Requirements

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage for new code

## Architecture Guidelines

### Backend (NestJS)

- Follow modular architecture
- Use dependency injection
- Implement proper error handling
- Use DTOs for validation
- Follow repository pattern for data access

### Frontend (Next.js)

- Use App Router conventions
- Implement proper loading states
- Handle errors gracefully
- Follow component composition patterns
- Use TypeScript strictly

### Database

- Use Drizzle ORM for all database operations
- Create migrations for schema changes
- Never modify existing migrations
- Add proper indexes for performance

## Security

- Never commit sensitive data (.env files, secrets)
- Follow OWASP security guidelines
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication/authorization

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Update API documentation in Swagger
- Keep architecture docs in sync with code

## Questions?

- Open an issue for bugs or feature requests
- Use discussions for questions
- Contact maintainers for urgent matters

## Code of Conduct

- Be professional and respectful
- Welcome newcomers
- Focus on constructive feedback
- Maintain a positive environment


```markdown
<!-- path: CHANGELOG.md -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with pnpm workspace
- Backend application with NestJS framework
- Frontend application with Next.js 14 (App Router)
- PostgreSQL database with Drizzle ORM
- Redis caching layer
- Docker and Docker Compose configuration
- ESLint and Prettier setup for monorepo
- Global exception filters and response interceptors
- Shared utilities (password hashing, date utilities)
- Pagination DTOs and decorators
- API documentation with Swagger
- Security middleware (Helmet, CORS)
- Validation pipeline with class-validator
- Database migration system
- Development and production Dockerfiles

### Documentation
- Project README with setup instructions
- Contributing guidelines
- Architecture documentation references
- API standards documentation

## [0.1.0] - 2026-04-26

### Added
- Project repository baseline (Task 3.1)
- Initial commit with production-ready structure
