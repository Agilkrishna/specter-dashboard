# Use Node.js 18 Bullseye as base (has better Python support)
FROM node:18-bullseye-slim

# Install Python 3 and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install --production

# Copy requirements.txt and install Python dependencies
# We consolidate all requirements into the root
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
