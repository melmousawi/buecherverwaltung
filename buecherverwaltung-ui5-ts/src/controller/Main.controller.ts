/// <reference types="openui5" />

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller: any, JSONModel: any, MessageToast: any, MessageBox: any) {
  "use strict";

  return Controller.extend("buecherverwaltung.controller.Main", {

    onInit: function () {

      const oModel = new JSONModel({
        books: [],                    // Alle Bücher vom Backend (unverändert)
        filteredBooks: [],            // Gefilterte Bücher (werden in der Tabelle angezeigt)
        newBook: {                    // Daten für den "Neues Buch"-Dialog
          title: "",
          author: "",
          createdBy: ""
        },
        editBook: null,               // Aktuell zu bearbeitendes Buch
        filter: {                     // NEU: Filter-Einstellungen und Statistiken
          startDate: null,            // Startdatum für den Filter (null = kein Startdatum)
          endDate: null,              // Enddatum für den Filter (null = kein Enddatum)
          totalCount: 0,              // Gesamtanzahl aller Bücher
          filteredCount: 0            // Anzahl der gefilterten Bücher
        },
        searchText: ""                // Suchtext für Titel
      });

      // Das Model auf die View setzen
      this.getView().setModel(oModel);

      // Bücher vom Backend laden
      this._loadBooks();
    },

    _loadBooks: async function () {
      try {
        // HTTP-GET-Request an das Backend
        // Endpoint: http://localhost:3001/api/books
        const res = await fetch("http://localhost:3001/api/books");

        // Prüfen, ob der Request erfolgreich war
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // JSON-Daten aus der Response extrahieren
        const data = await res.json();

        // Daten benutzerfreundlich formatieren, bevor sie angezeigt werden
        const formattedData = data.map(book => {
          return {
            ...book,  // Alle ursprünglichen Eigenschaften beibehalten
            formattedCreatedAt: this._formatDateUserFriendly(book.createdAt)  // Neues formatiertes Datum hinzufügen
          };
        });

        // Alle Bücher im Model speichern (jetzt mit formatiertem Datum)
        const model = this.getView().getModel();
        model.setProperty("/books", formattedData);

        // Filter-Statistiken aktualisieren
        this._updateFilterStats();

        // Aktuellen Filter anwenden (falls vorhanden)
        this._applyFilter();

      } catch (err) {
        // Fehlerbehandlung: Fehler in der Konsole ausgeben
        console.error("Fehler beim Laden der Bücher:", err);

        // Optional: Benutzer über den Fehler informieren
        MessageToast.show("Fehler beim Laden der Bücher");
      }
    },

    _updateFilterStats: function () {
      const model = this.getView().getModel();
      const allBooks = model.getProperty("/books") || [];
      const filteredBooks = model.getProperty("/filteredBooks") || [];

      // Statistiken im Filter-Bereich des Models aktualisieren
      model.setProperty("/filter/totalCount", allBooks.length);
      model.setProperty("/filter/filteredCount", filteredBooks.length);
    },

    _parseDateFromString: function (dateString) {
      if (!dateString || typeof dateString !== 'string') {
        return null;
      }

      // DEBUG: Eingabe-String ausgeben
      console.log("Parsing date string:", dateString);

      // Deutsches Datumsformat parsen: "dd.MM.yy" oder "dd.MM.yyyy"
      const parts = dateString.split('.');
      if (parts.length !== 3) {
        console.log("Invalid date format - expected dd.MM.yy or dd.MM.yyyy");
        return null;
      }

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript-Monate sind 0-basiert!
      let year = parseInt(parts[2], 10);

      // 2-stellige Jahre behandeln (25 -> 2025, 99 -> 1999)
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }

      // Date-Objekt erstellen
      const parsedDate = new Date(year, month, day);

      // DEBUG: Ergebnis ausgeben
      console.log("Parsed to:", parsedDate);

      return parsedDate;
    },


    /**
 *  _formatDateUserFriendly formatiert ein ISO-Datum in eine benutzerfreundliche deutsche Anzeige
 * 1. Nimmt ein ISO-Datum vom Backend entgegen (z.B. "2025-08-24T00:36:10.709Z")
 * 2. Wandelt es in ein benutzerfreundliches Format um
 * 3. Verwendet intelligente Formatierung je nach Zeitabstand
 * Beispiele:
 *  - Heute, 14:32 Uhr
 *  - Gestern, 08:15 Uhr
 *  - Vorgestern, 19:45 Uhr   // NEU
 *  - Montag, 19.08.2025, 11:00 Uhr   // NEU (letzte Woche)
 *  - 10.07.2025, 09:30 Uhr  (älter als eine Woche)
    */
    _formatDateUserFriendly: function (isoDateString) {
      if (!isoDateString) {
        return "";
      }

      // ISO-Datum in echtes JS-Date-Objekt umwandeln
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) {
        return isoDateString; // Fallback, falls ungültiges Datum
      }

      // Aktuelles Datum für Vergleich berechnen
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const vorgestern = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // NEU
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // NEU

      // Vergleichsdatum (nur Jahr, Monat, Tag – Uhrzeit raus)
      const bookDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // Uhrzeit immer 2-stellig formatieren
      const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
      const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
      const timeString = `${hours}:${minutes} Uhr`;

      // Deutsche Wochentage
      const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

      // === Intelligente Formatierung ===
      if (bookDate.getTime() === today.getTime()) {
        // Heute
        return `Heute, ${timeString}`;
      } else if (bookDate.getTime() === yesterday.getTime()) {
        // Gestern
        return `Gestern, ${timeString}`;
      } else if (bookDate.getTime() === vorgestern.getTime()) { // NEU
        // Vorgestern
        return `Vorgestern, ${timeString}`;
      } else if (bookDate.getTime() >= oneWeekAgo.getTime()) { // NEU
        // Letzte Woche: Wochentag + Datum + Uhrzeit
        const weekday = weekdays[bookDate.getDay()];
        const day = (bookDate.getDate() < 10 ? '0' : '') + bookDate.getDate();
        const month = ((bookDate.getMonth() + 1) < 10 ? '0' : '') + (bookDate.getMonth() + 1);
        const year = bookDate.getFullYear();
        return `${weekday}, ${day}.${month}.${year}, ${timeString}`;
      } else {
        // Älter als eine Woche → Nur Datum + Uhrzeit
        const day = (bookDate.getDate() < 10 ? '0' : '') + bookDate.getDate();
        const month = ((bookDate.getMonth() + 1) < 10 ? '0' : '') + (bookDate.getMonth() + 1);
        const year = bookDate.getFullYear();
        return `${day}.${month}.${year}, ${timeString}`;
      }
    },


    /**
     * Such- und Filterfunktion
     * Wird bei liveChange vom SearchField und bei Datum/anderen Filtern genutzt.
     * Wendet den aktuellen Filter auf die Bücherliste an
     */
    _applyFilter: function () {
      const model = this.getView().getModel();
      const allBooks = model.getProperty("/books") || [];
      const startDate = model.getProperty("/filter/startDate");
      const endDate = model.getProperty("/filter/endDate");
      // NEU: Suchtext aus Model holen und klein schreiben
      const searchText = (model.getProperty("/filter/searchText") || "").toLowerCase();

      // DEBUG: Ausgabe der Filter-Werte
      console.log("=== FILTER DEBUG ===");
      console.log("Alle Bücher:", allBooks.length);
      console.log("Startdatum (Raw):", startDate);
      console.log("Enddatum (Raw):", endDate);
      console.log("Suchtext:", searchText); // NEU

      // Wenn keine Filter gesetzt sind (Datum + Suche leer), alle Bücher anzeigen
      if (!startDate && !endDate && !searchText) { // searchText hinzugefügt
        // if (!startDate && !endDate ) { // TODO 
        console.log("Keine Filter gesetzt - alle Bücher anzeigen");
        model.setProperty("/filteredBooks", allBooks);
        this._updateFilterStats();
        return;
      }

      // Datum korrekt parsen
      let parsedStartDate = null;
      let parsedEndDate = null;

      if (startDate) {
        parsedStartDate = this._parseDateFromString(startDate);
        console.log("Parsed Startdatum:", parsedStartDate);
      }

      if (endDate) {
        parsedEndDate = this._parseDateFromString(endDate);
        console.log("Parsed Enddatum:", parsedEndDate);
      }

      // Bücher nach Datum UND Suchtext filtern
      const filteredBooks = allBooks.filter(book => {
        // Buchdatum parsen
        const bookDate = new Date(book.createdAt);
        const bookDateOnly = new Date(bookDate.getFullYear(), bookDate.getMonth(), bookDate.getDate());

        // DEBUG: Ausgabe der Datumswerte
        console.log("Buch:", book.title);
        console.log("  Original createdAt:", book.createdAt);
        console.log("  bookDateOnly:", bookDateOnly);

        // NEU: Titel-Suche prüfen (Case-insensitive)
        if (searchText && !book.title.toLowerCase().includes(searchText)) {
          console.log("  Fällt durch wegen Suche:", book.title);
          return false;
        }

        // Nur Datum prüfen, wenn Suchtext OK
        if (!parsedStartDate && parsedEndDate) {
          return bookDateOnly <= parsedEndDate;
        }
        if (!parsedEndDate && parsedStartDate) {
          return bookDateOnly >= parsedStartDate;
        }
        if (parsedStartDate && parsedEndDate) {
          return bookDateOnly >= parsedStartDate && bookDateOnly <= parsedEndDate;
        }

        return true; // Wenn keine Datumsfilter, aber Suchtext OK
      });

      console.log("Gefilterte Bücher:", filteredBooks.length);
      console.log("=== ENDE FILTER DEBUG ===");

      model.setProperty("/filteredBooks", filteredBooks);
      this._updateFilterStats();
    },

    onStartDateChange: function (oEvent: any) {
      // Das neue Startdatum aus dem Event extrahieren
      const newStartDate = oEvent.getParameter("value");

      // Startdatum im Model aktualisieren
      const model = this.getView().getModel();
      model.setProperty("/filter/startDate", newStartDate);

      // Filter sofort anwenden
      this._applyFilter();

      // Benutzer über die Filterung informieren
      if (newStartDate && newStartDate instanceof Date) {
        MessageToast.show(`Filter angewendet: Bücher ab ${newStartDate.toLocaleDateString('de-DE')}`);
      } else if (newStartDate === null) {
        MessageToast.show("Startdatum-Filter entfernt");
      }
    },

    onEndDateChange: function (oEvent: any) {
      // Das neue Enddatum aus dem Event extrahieren
      const newEndDate = oEvent.getParameter("value");

      // Enddatum im Model aktualisieren
      const model = this.getView().getModel();
      model.setProperty("/filter/endDate", newEndDate);

      // Filter sofort anwenden
      this._applyFilter();

      // Benutzer über die Filterung informieren
      if (newEndDate && newEndDate instanceof Date) {
        MessageToast.show(`Filter angewendet: Bücher bis ${newEndDate.toLocaleDateString('de-DE')}`);
      } else if (newEndDate === null) {
        MessageToast.show("Enddatum-Filter entfernt");
      }
    },

    onResetFilter: function () {
      const model = this.getView().getModel();

      // Suchtext leeren, damit Input-Feld sofort aktualisiert
      model.setProperty("/filter/searchText", "");

      // Alle Filter-Einstellungen zurücksetzen
      model.setProperty("/filter/startDate", null);
      model.setProperty("/filter/endDate", null);

      // Alle Bücher anzeigen (Filter entfernen)
      const allBooks = model.getProperty("/books") || [];
      model.setProperty("/filteredBooks", allBooks);

      // Filter-Statistiken aktualisieren
      this._updateFilterStats();

      // Benutzer über die Aktion informieren
      MessageToast.show("Alle Filter wurden zurückgesetzt");
    },

    /**
     * Diese Funktion:
     * 1. Wird aufgerufen, wenn der Benutzer auf "Neues Buch" klickt
     * 2. Leert die Eingabefelder im Dialog
     * 3. Öffnet den Dialog
     */
    onOpenCreateDialog: function () {
      // Dialog öffnen und Felder leeren
      const model = this.getView().getModel();
      model.setProperty("/newBook", { title: "", author: "", createdBy: "" });
      this.byId("createDialog").open();
    },

    onCreateBook: async function () {
      // REST POST zum Erstellen
      const model = this.getView().getModel();
      const book = model.getProperty("/newBook");

      try {
        // HTTP-POST-Request an das Backend
        const res = await fetch("http://localhost:3001/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(book)
        });

        // Prüfen, ob der Request erfolgreich war
        if (res.ok) {
          // Erfolg: Dialog schließen und Bücherliste aktualisieren
          MessageToast.show("Buch erfolgreich angelegt");
          this.byId("createDialog").close();

          // NEU: Bücherliste neu laden und Filter anwenden
          this._loadBooks();
        } else {
          // Fehler vom Backend
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        // Fehlerbehandlung
        console.error("Fehler beim Anlegen des Buches:", err);
        MessageToast.show("Fehler beim Anlegen des Buches");
      }
    },

    /**
     * Diese Funktion:
     * 1. Wird aufgerufen, wenn der Benutzer auf "Abbrechen" klickt
     * 2. Schließt den Dialog einfach
     */
    onCancelCreate: function () {
      // Dialog einfach schließen
      this.byId("createDialog").close();
    },

    onEditBook: function (oEvent: any) {
      // Das ausgewählte Buch aus dem BindingContext holen
      const ctx = oEvent.getSource().getBindingContext();
      const book = ctx.getObject();

      // Kopie speichern, damit Original nicht direkt verändert wird
      this.getView().getModel().setProperty("/editBook", { ...book });

      // Bearbeiten-Dialog öffnen
      this.getView().byId("editDialog").open();
    },

    onSaveDraft: async function () {
      const model = this.getView().getModel();
      const book = model.getProperty("/editBook");

      try {
        // HTTP-PUT-Request an das Backend
        const res = await fetch(`http://localhost:3001/api/books/${book.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(book)
        });

        // Prüfen, ob der Request erfolgreich war
        if (res.ok) {
          // Erfolg: Dialog schließen und Bücherliste aktualisieren
          MessageToast.show("Buch erfolgreich aktualisiert");
          this.getView().byId("editDialog").close();

          // Bücherliste neu laden und Filter anwenden
          this._loadBooks();
        } else {
          // Fehler vom Backend
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        // Fehlerbehandlung
        console.error("Fehler beim Aktualisieren des Buches:", err);
        MessageToast.show("Fehler beim Aktualisieren des Buches");
      }
    },

    // Bricht die Bearbeitung ab, stellt alte Daten wieder her.
    onCancelDraft: function () {
      // Dialog schließen
      this.getView().byId("editDialog").close();

      // editBook-Daten leeren
      this.getView().getModel().setProperty("/editBook", null);
    },

    // onDeleteBook: async function (oEvent: any) {
    //   // Das zu löschende Buch aus dem BindingContext holen
    //   const ctx = oEvent.getSource().getBindingContext();
    //   const book = ctx.getObject();

    //   // Referenz auf den Controller für den Callback speichern
    //   const that = this;

    //   // Bestätigungsdialog anzeigen
    //   MessageBox.confirm(`Buch "${book.title}" wirklich löschen?`, {
    //     actions: ["Ja", "Nein"],
    //     onClose: async function (action: string) {
    //       if (action === "Ja") {
    //         try {
    //           // HTTP-DELETE-Request an das Backend
    //           await fetch(`http://localhost:3001/api/books/${book.id}`, { 
    //             method: "DELETE" 
    //           });

    //           // Erfolg: Benutzer informieren und Bücherliste aktualisieren
    //           MessageToast.show("Buch erfolgreich gelöscht");

    //           // NEU: Bücherliste neu laden und Filter anwenden
    //           that._loadBooks();
    //         } catch (err) {
    //           // Fehlerbehandlung
    //           console.error("Fehler beim Löschen des Buches:", err);
    //           MessageToast.show("Fehler beim Löschen des Buches");
    //         }
    //       }
    //     }
    //   });
    // },

    onSearchBooks: function (oEvent: any) {
      const value = oEvent.getParameter("newValue") || oEvent.getParameter("query");
      this.getView().getModel().setProperty("/filter/searchText", value);
      this._applyFilter();
    },

  });
});
