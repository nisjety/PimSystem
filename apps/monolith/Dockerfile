# Build stage
FROM node:16 AS builder

WORKDIR /app

# Install Prisma globally with a specific version
RUN npm install -g prisma@4.16.2

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Debug: List contents before build
RUN echo "Contents before build:" && ls -la

# Set DATABASE_URL for Prisma generate
ENV DATABASE_URL="postgresql://pim_user:pim_password@postgres:5432/pim_db"

# Generate Prisma client
RUN prisma generate

# Build application
RUN npm run build

# Debug: List contents after build
RUN echo "Contents after build:" && ls -la && echo "Contents of dist:" && ls -la dist/

# Production stage
FROM node:16-slim

WORKDIR /app

# Copy package files and built application
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Debug: List contents in production
RUN echo "Contents in production:" && ls -la && echo "Contents of dist:" && ls -la dist/

# Set production environment
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://pim_user:pim_password@postgres:5432/pim_db"

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "start:prod"] 