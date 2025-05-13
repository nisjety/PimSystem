# PIM System - Monolithic Backend

A robust Product Information Management (PIM) system built with NestJS, featuring Google Sheets integration, Redis caching, and Clerk authentication.

## Features

- 🏗️ Built with NestJS and TypeScript
- 📊 Google Sheets integration for data import
- 🔒 Clerk-based authentication and authorization
- 💾 PostgreSQL database with Prisma ORM
- 🚀 Redis caching for improved performance
- 📚 Swagger API documentation
- 🔍 Advanced product search and filtering
- 🎯 Role-based access control (RBAC)
- 🌐 CORS support
- 🛡️ Security features (Helmet, rate limiting)
- 📝 Comprehensive logging and error handling

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Redis
- Google Cloud Platform account (for Sheets API)
- Clerk account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# App
NODE_ENV=development
PORT=3001
API_PREFIX=api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pim_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id

# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# CORS
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_CREDENTIALS=true

# Swagger
SWAGGER_ENABLED=true
SWAGGER_TITLE=PIM System API
SWAGGER_DESCRIPTION=Product Information Management System API Documentation
SWAGGER_VERSION=1.0
SWAGGER_PATH=docs
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
http://localhost:3001/docs

## Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply pending migrations
npm run prisma:migrate
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── config/                 # Configuration modules
├── infrastructure/         # Shared infrastructure code
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Authentication guards
│   ├── interceptors/      # Global interceptors
│   ├── redis/             # Redis module
│   └── google-sheets/     # Google Sheets integration
├── modules/               # Feature modules
│   └── products/          # Products module
│       ├── dto/          # Data Transfer Objects
│       ├── entities/     # Domain entities
│       ├── controllers/  # Route controllers
│       └── services/     # Business logic
└── main.ts               # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 