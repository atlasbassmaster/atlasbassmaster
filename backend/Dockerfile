FROM node:18-alpine
WORKDIR /app

COPY package.json ./
RUN npm install 

COPY . .

# Appliquer les permissions sur tout le projet
RUN chmod -R 755 /app

CMD ["node", "src/app.js"]
