# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine

WORKDIR /app

# Only copy production dependencies and built assets
COPY package*.json ./
RUN npm install --production

COPY --from=build /app/dist ./dist
COPY server.js ./

EXPOSE 80

CMD ["node", "server.js"]
