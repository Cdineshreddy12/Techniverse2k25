# Build stage
FROM node:20-alpine as builder
WORKDIR /app

# Add npm configuration
COPY .npmrc .
COPY package*.json ./

# Install dependencies with optimizations
RUN npm ci --legacy-peer-deps --no-audit --prefer-offline \
    --max-old-space-size=2048 \
    && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
