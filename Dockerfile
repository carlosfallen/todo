FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expor as portas do frontend e backend
EXPOSE 5173 3001

# Rodar o script de desenvolvimento
CMD ["npm", "run", "dev"]

