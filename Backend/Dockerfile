# Use the official Node.js 20 Alpine image for a lightweight container
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json. first (improves build caching)
COPY package*.json ./

# Install dependencies
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --legacy-peer-deps && \
    npm install expresscheckout-nodejs --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Add a health check to ensure the app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Expose port 4000 for the application
EXPOSE 4000

# Run the application
CMD ["node", "index.js"]