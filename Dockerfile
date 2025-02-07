FROM node:20-alpine

WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

EXPOSE 3000

# Use non-root user for better security
USER node

CMD ["node", "server.js"] 