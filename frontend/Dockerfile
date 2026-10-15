# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy dulu file dependency biar cache layer efektif
COPY package.json package-lock.json ./

RUN npm ci

# Copy sisa source code
COPY . .

# Build production (hasil di folder /app/dist untuk Vite)
RUN npm run build

# ---- Stage 2: Serve dengan nginx ----
FROM nginx:1.27-alpine

# Hapus konfigurasi default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Pakai config custom (support React Router / SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build dari stage sebelumnya
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]