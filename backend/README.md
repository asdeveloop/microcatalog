<!-- path: backend/README.md -->
# Backend Application

NestJS-based REST API with PostgreSQL and Redis.

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Cache**: Redis 7
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, bcrypt

## Getting Started

### Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x
- PostgreSQL 16
- Redis 7

### Installation
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

### Database Setup

bash
# Generate migration from schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed database (optional)
pnpm db:seed

### Development

bash
# Start in development mode
pnpm start:dev

# Start in watch mode
pnpm start:debug

# Build for production
pnpm build

# Start production build
pnpm start:prod

## Project Structure


src/
├── modules/              # Feature modules
│   └── (future modules)
├── shared/              # Shared resources
│   ├── database/        # Database configuration & schemas
│   ├── filters/         # Exception filters
│   ├── interceptors/    # Response interceptors
│   ├── decorators/      # Custom decorators
│   ├── dto/            # Data Transfer Objects
│   ├── types/          # TypeScript types
│   ├── enums/          # Enumerations
│   └── utils/          # Utility functions
├── config/             # Configuration files
├── app.module.ts       # Root module
└── main.ts            # Application entry point

## Available Scripts

bash
pnpm start              # Start application
pnpm start:dev          # Start in development mode
pnpm start:debug        # Start in debug mode
pnpm start:prod         # Start production build

pnpm build              # Build application
pnpm lint               # Lint code
pnpm test               # Run unit tests
pnpm test:e2e           # Run E2E tests
pnpm test:cov           # Generate coverage report

pnpm db:generate        # Generate migration
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Drizzle Studio
pnpm db:seed            # Seed database

## API Documentation

Swagger documentation is available at:
- http://localhost:3001/api/docs

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Allowed CORS origins

## Testing

bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Watch mode
pnpm test:watch

## Database Migrations

bash
# Create new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Rollback (manual - edit migration file)
# Then run: pnpm db:migrate

## Security

- Helmet for HTTP headers security
- CORS configuration
- Input validation with class-validator
- Password hashing with bcrypt (12 rounds)
- JWT authentication (to be implemented)

## Error Handling

All errors are handled by global exception filters:
- `AllExceptionsFilter`: Catches all unhandled exceptions
- `HttpExceptionFilter`: Handles HTTP exceptions

Response format:
json
{
  "success": false,
  "error": {
"code": "ERROR_CODE",
"message": "Error message",
"details": {}
  },
  "timestamp": "2026-04-26T12:00:00.000Z",
  "path": "/api/v1/endpoint"
}

## Response Format

All successful responses follow this format:
json
{
  "success": true,
  "data": {},
  "timestamp": "2026-04-26T12:00:00.000Z",
  "path": "/api/v1/endpoint"
}

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

