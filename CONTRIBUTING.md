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

````bash
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
````
