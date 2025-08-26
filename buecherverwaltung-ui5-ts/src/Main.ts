/// <reference types="openui5" />
// Einstiegspunkt: lädt die XML-View und rendert sie in #content.
sap.ui.define([
  "sap/ui/core/mvc/XMLView"
], function(XMLView: any) {
  "use strict";
  XMLView.create({ viewName: "buecherverwaltung.view.App" }).then((oView: any) => {
    oView.placeAt("content");
  });
});
