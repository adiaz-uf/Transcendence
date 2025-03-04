# Use the latest LTS version of Node.js
FROM node:22-alpine AS builder
 
# Set the working directory inside the container
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and package-lock.json
COPY package*.json pnpm-lock.yaml ./

# Configurer le cache PNPM
RUN pnpm config set store-dir .pnpm-store

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your application files
COPY . .
 
# Build the React application
RUN pnpm run build

# Use a smaller, optimized image for serving the app
FROM node:22-alpine AS runner

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/build ./build

RUN npm install -g serve pnpm

# Expose the port your app runs on
EXPOSE 3000
 
# Serve the built React app
CMD ["serve",  "-s",  "build"]
