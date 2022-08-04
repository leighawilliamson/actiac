FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY ./public/. /public/

RUN ls -la /public/img/*

EXPOSE 8082

CMD ["node", "app.js"]
