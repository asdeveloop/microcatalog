<!-- path: frontend/README.md -->

# Frontend Application

Next.js 14 application with App Router and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14.x
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **HTTP Client**: Axios
- **UI Components**: (to be added)

## Getting Started

### Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x

### Installation
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

### Development

bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

## Project Structure


src/
├── app/                 # App Router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   └── (future components)
├── lib/               # Utilities & helpers
│   └── (future utilities)
└── styles/            # Additional styles

## Available Scripts

bash
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Lint code

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Styling

This project uses Tailwind CSS for styling.

### Tailwind Configuration

See `tailwind.config.ts` for theme customization.

### Global Styles

Global styles are defined in `src/app/globals.css`.

## API Integration

API calls should be made using axios with the base URL from environment variables:

typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

## Routing

This project uses Next.js App Router:
- File-based routing in `src/app/`
- Server Components by default
- Client Components with `'use client'` directive

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.


```json
// path: package.json (update - add metadata)
{
  "name": "project-monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "Production-ready monorepo with NestJS backend and Next.js frontend",
  "keywords": [
    "monorepo",
    "nestjs",
    "nextjs",
    "typescript",
    "postgresql",
    "redis"
  ],
  "author": "",
  "license": "UNLICENSED",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev:backend": "pnpm --filter backend start:dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "build": "pnpm -r build",
    "build:backend": "pnpm --filter backend build",
    "build:frontend": "pnpm --filter frontend build",
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm -r lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "test": "pnpm -r test",
    "test:backend": "pnpm --filter backend test",
    "test:frontend": "pnpm --filter frontend test"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "prettier": "^3.2.5",
    "typescript": "^5.4.5"
  }
}
