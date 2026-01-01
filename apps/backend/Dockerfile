# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

# Copy all files (monorepo root context)
COPY . .

# Install dependencies
RUN npm install

# Build the backend
RUN npm run build -w apps/backend

# Stage 2: Runtime
FROM node:20-slim
WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/apps/backend/dist ./dist
# Copy node_modules (this includes all modules, might be large but ensures it works)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./

# Expose the backend port
EXPOSE 3000

CMD ["node", "dist/src/main"]

