<<<<<<< HEAD
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
=======
FROM node:16-bullseye
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
>>>>>>> 4507b86 (Initial commit of Taifas server-side code)
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
