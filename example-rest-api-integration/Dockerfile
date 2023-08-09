# Base image
FROM node:18

# --> Set your app directtory here
WORKDIR /home/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main"]