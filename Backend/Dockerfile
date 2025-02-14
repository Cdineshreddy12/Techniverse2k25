# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (improves caching)
COPY package*.json ./

# Install dependencies using npm ci for a reliable install
RUN npm config set registry https://registry.npmjs.org/ && \
    npm ci --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Add a health check to ensure the app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Expose port 4000 for the application
EXPOSE 4000

# Run the application
CMD ["node", "index.js"]
