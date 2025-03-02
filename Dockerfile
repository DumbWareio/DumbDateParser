FROM node:20-alpine

WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Fix permissions for mounted volumes
RUN chmod -R 755 /app && chown -R node:node /app

EXPOSE 3001

# Use non-root user for better security
USER node

CMD ["node", "server.js"] 