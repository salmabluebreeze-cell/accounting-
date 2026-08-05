# Phase 1: Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# التمرير لمتغيرات البيئة أثناء البناء
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_PROJECT_ID
ENV REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY
ENV REACT_APP_FIREBASE_PROJECT_ID=$REACT_APP_FIREBASE_PROJECT_ID

RUN npm run build

# Phase 2: Production stage using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]