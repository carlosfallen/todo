FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Expor a porta que será usada
EXPOSE 3001

# Usar variável de ambiente PORT (padrão 3001)
ENV PORT=3001

CMD ["node", "server/index.js"]
