# Multi-stage Build para otimização do tamanho final
FROM node:24-alpine AS builder

WORKDIR /app

# Instalação de dependências
COPY package*.json ./
RUN npm ci

# Compilação do TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage Final de Execução
FROM node:24-alpine AS runner

WORKDIR /app

# Variável de ambiente de produção
ENV NODE_ENV=production

# Copia apenas as dependências de produção e o código compilado
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Expõe a porta configurada
EXPOSE 8080

# Comando de inicialização
CMD ["node", "dist/server.js"]