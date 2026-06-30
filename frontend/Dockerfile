# Stage 1: Build static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy remaining frontend source code
COPY . .

# Inject the public API URL environment variable at build-time (required for static Astro generation)
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=${PUBLIC_API_URL}

# Compile and build the Astro project
RUN npm run build

# Stage 2: Serve compiled static files
FROM nginx:alpine

# Copy static assets from build phase
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
