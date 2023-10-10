FROM node:18-alpine3.18 as builder
RUN mkdir /app
WORKDIR "/app"
COPY . .
RUN npm install
CMD [ "npm", "run", "start" ]