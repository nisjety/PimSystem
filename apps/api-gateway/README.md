# PIM System API Gateway

The API Gateway service for the Product Information Management (PIM) System. This service acts as the entry point for all client requests, handling authentication, request routing, WebSocket connections, and more.

## Features

- 🔐 Clerk Authentication
- 🚦 Request Routing
- 🔄 WebSocket Support
- ⚡ Rate Limiting
- 📝 Swagger Documentation
- 🛡️ Security Middleware

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Clerk account and API keys

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your environment variables:
```bash
cp .env.example .env
```

## Configuration

The following environment variables are required:

- `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `FRONTEND_URL`: URL of your frontend application
- `MONOLITH_URL`: URL of your monolith service
- `AI_SERVICE_URL`: URL of your AI service
- `ANALYTICS_SERVICE_URL`: URL of your analytics service
- `INTEGRATION_SERVICE_URL`: URL of your integration service

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## WebSocket Events

The following WebSocket events are supported:

- `search:live`: Real-time search updates
- `stock:update`: Stock level changes
- `notifications:subscribe`: Subscribe to user notifications

## Security

This service implements several security measures:

- Clerk Authentication
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
