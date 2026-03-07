# Etapa de construccion
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration=production

# Etapa de produccion
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/CoffeManagerWeb /usr/share/nginx/html
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
