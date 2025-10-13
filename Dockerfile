## Multi-stage Dockerfile for FutebolAnalyticsPro
FROM node:18-alpine AS builder
WORKDIR /app
COPY server/package*.json ./server/
RUN apk add --no-cache libc6-compat
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY server ./server
ENV NODE_ENV=production
EXPOSE 3000
VOLUME ["/app/server/data"]
CMD ["node", "server/index.js"]
