FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY .sequelizerc ./
COPY src ./src

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Aplica as migrations pendentes e inicia a API
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/server.js"]
