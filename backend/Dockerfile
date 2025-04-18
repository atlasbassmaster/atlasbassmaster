FROM node:18-alpine
WORKDIR /app

COPY package.json ./
RUN npm install 

COPY . .

# Ajoute le script wait-for-db
COPY wait-for-db.sh .
RUN chmod +x wait-for-db.sh

CMD ["node", "src/app.js"]
