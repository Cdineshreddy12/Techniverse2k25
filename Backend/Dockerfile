FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --legacy-peer-deps

COPY . .

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

EXPOSE 4000

CMD ["npm", "start"]