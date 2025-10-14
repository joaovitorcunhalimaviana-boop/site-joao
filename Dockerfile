FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with clean cache
RUN npm ci --legacy-peer-deps --no-cache

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application (migrations handled by scripts/safe-migrate.js via npm start)
CMD ["sh", "-c", "npm start"]