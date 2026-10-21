FROM node:22-alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine AS runtime
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /build/dist /usr/share/nginx/html
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
ENV BACKEND_UPSTREAM=backend:8080
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
