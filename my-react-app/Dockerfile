# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

# No need to copy nginx.conf as we'll use the host's configuration
COPY --from=builder /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]