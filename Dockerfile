FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Expose Port 80
EXPOSE 80
ENV PORT 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Start application on Port 80
CMD ["npx", "next", "start", "-p", "80"]
