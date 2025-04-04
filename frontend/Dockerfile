FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Supprimez EXPOSE 3000 (inutile pour Nginx)
CMD ["nginx", "-g", "daemon off;"]