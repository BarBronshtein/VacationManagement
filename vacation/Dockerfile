# ── deps stage ──────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY vacation/package*.json ./
RUN npm i

# ── development stage (hot-reload) ──────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=deps /app/node_modules ./node_modules
COPY vacation/ .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]