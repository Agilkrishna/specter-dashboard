FROM node:18-slim
RUN apt-get update && apt-get install -y python3 python3-pip curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN pip3 install --no-cache-dir -r little-brother/requirements.txt || echo "No requirements found"
RUN ln -s /usr/bin/python3 /usr/bin/python
EXPOSE 3000
CMD ["npm", "start"]
