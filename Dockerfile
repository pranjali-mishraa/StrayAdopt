# ==========================================
# Stage 1: Build React Frontend
# ==========================================

FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ .

RUN npm run build


# ==========================================
# Stage 2: Backend + React
# ==========================================

FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install --omit=dev

COPY backend/ .

COPY --from=frontend-builder /app/dist ./public

CMD ["node", "server.js"]