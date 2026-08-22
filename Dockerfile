# ==========================================
# Stage 1: Build React Frontend
# ==========================================

FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Create production build
RUN npm run build


# ==========================================
# Stage 2: Backend + React
# ==========================================

FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ .

# Copy React build into backend/public
COPY --from=frontend-builder /app/dist ./public

# Application port
EXPOSE 8000

# Start backend
CMD ["node", "server.js"]