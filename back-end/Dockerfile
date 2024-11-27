FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

# Aqui está o npm start para iniciar o servidor Node.js
CMD ["npm", "start"]
