# Stage 1: Build environment
FROM node:22-alpine AS builder

WORKDIR /app

# Fix native binding bug by ignoring mac's package-lock and installing native alpine binaries
COPY package.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production environment
FROM node:22-alpine AS runner

WORKDIR /app

# Copy package mapping
COPY --from=builder /app/package.json ./

# Install only production dependencies for smaller image
RUN npm install --omit=dev

# Copy the compiled standalone Node app
COPY --from=builder /app/build ./build

# Map to Svelte's default dev port as requested
ENV HOST=0.0.0.0
ENV PORT=5173
ENV NODE_ENV=production

EXPOSE 5173

# Start the Node server provided by adapter-node
CMD ["node", "build/index.js"]
