FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npx", "tailwindcss", "-i", "./src/index.css", "-o", "./public/output.css", "--watch"]
