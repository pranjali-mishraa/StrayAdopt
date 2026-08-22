# ==========================================
# Stage 1: Build React Frontend
# ==========================================

FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY Frontend/package*.json ./

RUN npm install

COPY Frontend/ .

RUN npm run build


# ==========================================
# Stage 2: Backend + React
# ==========================================

FROM node:20-alpine

WORKDIR /app

COPY Backend/package*.json ./

RUN npm install --omit=dev

COPY Backend/ .

COPY --from=frontend-builder /app/dist ./public

EXPOSE 8000

CMD ["node", "server.js"]