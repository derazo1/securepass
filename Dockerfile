FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/app.conf nginx/http.conf nginx/https.conf nginx/security-headers.conf /etc/nginx/securepass/
COPY --chmod=755 nginx/start.sh /usr/local/bin/securepass-start
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
CMD ["/usr/local/bin/securepass-start"]
