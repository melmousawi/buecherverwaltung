# Node.js als Base
FROM node:18

# Arbeitsverzeichnis
WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Code reinziehen
COPY . .

# Build deiner UI5 App
RUN npm run build

# HTTP-Server installieren für Auslieferung
RUN npm install -g http-server

# Port öffnen
EXPOSE 8080

# App starten
CMD ["http-server", "dist", "-p", "8080", "-c-1", "--cors"]
