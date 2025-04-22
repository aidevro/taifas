FROM node:16-bullseye
WORKDIR /app
COPY package*.json ./
#COPY node_modules ./node_modules
RUN npm install dotenv && npm install

COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
