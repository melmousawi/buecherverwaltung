# 📚 Bücherverwaltung – SAPUI5 + TypeScript

**Ziel:** Frontend-Demo mit SAPUI5 + TypeScript inkl. CRUD (Create, Update, Delete) über einen Dialog.

## 🚀 Start
1. `npm install`
2. `npm run build`  → TS → `dist/`, XML wird kopiert (falls Script vorhanden)
3. `index.html` mit VS Code **Live Server** öffnen

## 📂 Struktur
```
src/
  controller/
    App.controller.ts
    Main.controller.ts
  view/
    App.view.xml
    Main.view.xml
index.html
tsconfig.json
```

## ✅ Features
- Bücherliste (Tabelle)
- **Anlegen & Bearbeiten** im selben Dialog (draft-Objekt)
- **Löschen** mit Bestätigung (MessageBox)
- **Two-Way-Binding** in Formularfeldern

## 🔁 Two-Way-Binding (UI5) vs One-Way (React)
- **React:** One-Way-Data-Flow. State-Updates laufen explizit über Hooks/State-Setter.
- **UI5 JSONModel:** Standardmäßig **Two-Way** → `Input value="{/draft/title}"` schreibt automatisch ins Model.
- **Praxisnutzen:** Weniger Boilerplate in Formularen; du liest/schreibst direkt über `model.getProperty("/draft")`.

## 🧠 Erklär-Notizen fürs Interview
- Trennung von **App-View (Shell)** und **Main-View (Inhalt)**.
- **Draft-Objekt** vermeidet, dass ungespeicherte Änderungen direkt in der Liste landen.
- **Konsequentes Binding** (`/books`, `/draft`, `/editIndex`) macht die View deklarativ.
