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

# Copy source
COPY . .

# Create .env.production file before build
ARG VITE_APP_BACKEND_URL
ARG VITE_APP_KINDE_CLIENT_ID
ARG VITE_APP_KINDE_ISSUER_URL
ARG VITE_APP_KINDE_REDIRECT_URL
ARG VITE_APP_KINDE_POST_LOGOUT_URL

# Create .env.production with build arguments
RUN printf "VITE_APP_BACKEND_URL=%s\n\
VITE_APP_KINDE_CLIENT_ID=%s\n\
VITE_APP_KINDE_ISSUER_URL=%s\n\
VITE_APP_KINDE_REDIRECT_URL=%s\n\
VITE_APP_KINDE_POST_LOGOUT_URL=%s" \
    "$VITE_APP_BACKEND_URL" \
    "$VITE_APP_KINDE_CLIENT_ID" \
    "$VITE_APP_KINDE_ISSUER_URL" \
    "$VITE_APP_KINDE_REDIRECT_URL" \
    "$VITE_APP_KINDE_POST_LOGOUT_URL" > .env.production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]