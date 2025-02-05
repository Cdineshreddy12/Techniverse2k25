FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --legacy-peer-deps

COPY . .

EXPOSE 4000

CMD ["npm", "start"]