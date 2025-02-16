FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Set npm configuration for better reliability
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set strict-ssl false \
    && npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retry-mintimeout 10000

# First, try to install expresscheckout-nodejs explicitly
RUN npm install expresscheckout-nodejs@1.0.0 --save

# Then install all other dependencies
RUN npm ci --legacy-peer-deps || \
    (npm cache clean --force && npm ci --legacy-peer-deps)

# Copy the rest of the application files
COPY . .

# Add a health check to ensure the app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Expose port 4000 for the application
EXPOSE 4000

# Run the application
CMD ["node", "index.js"]