# Node.js als Base
FROM node:18

# Arbeitsverzeichnis
WORKDIR /app

# Package.json reinziehen und Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Restlichen Code reinziehen
COPY . .

# Port öffnen
EXPOSE 3001

# Startkommando
CMD ["npm", "start"]
