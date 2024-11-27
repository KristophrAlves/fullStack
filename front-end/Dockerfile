FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Aqui está o npm start para iniciar o servidor React
CMD ["npm", "start"]
