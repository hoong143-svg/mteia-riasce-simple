FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY backend/ ./backend/

# Copy built frontend
COPY frontend/dist/ ./frontend/dist/

# Install backend deps
WORKDIR /app/backend
RUN npm install

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]