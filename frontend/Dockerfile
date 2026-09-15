# Etapa 1: Build da aplicação Angular
FROM node:22-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de forma limpa
RUN npm ci --legacy-peer-deps

# Copiar código-fonte da aplicação
COPY . .

# Executar build de produção (gera a pasta dist/frontend/browser)
RUN npm run build

# Etapa 2: Servidor Nginx para servir os arquivos estáticos e fazer proxy para a API
FROM nginx:alpine

# Copiar configuração do Nginx com suporte a SPA e Proxy reverso para o backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos compilados do Angular para o diretório padrão do Nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Expor porta 80 do container
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
