# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for both server and client
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install-all

# Copy source code
COPY . .

# Debug: List files before build
# RUN ls -la /app/client

# Build the client for production
RUN cd client && npm run build

# Debug: Check if build directory exists
#RUN ls -la /app/client/build

# Move client build to server's public directory
RUN mkdir -p server/public
RUN mv client/build/* server/public/

# Debug: Check if files were moved correctly
# RUN ls -la /app/server/public

WORKDIR /app/server

EXPOSE 5000

# Use a shell script to determine startup command based on environment
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"] 