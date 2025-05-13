# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

# Copy prisma schema first
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Install production dependencies and wait-for-it script
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

# Copy built files and Prisma artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Add wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Create startup script
RUN echo '#!/bin/sh\n\
/wait-for-it.sh postgres:5432 -t 60 -- echo "Database is up"\n\
npx prisma generate\n\
npx prisma migrate deploy\n\
node dist/main.js' > /start.sh && chmod +x /start.sh

CMD ["/start.sh"]
