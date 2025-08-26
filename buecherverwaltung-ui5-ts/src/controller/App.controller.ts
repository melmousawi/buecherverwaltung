/// <reference types="openui5" />
/**
 * App.controller.ts (minimal)
 * - Hält aktuell keine Logik; dient als sauberer Einstiegspunkt.
 * - Vorteil für größere Apps: Hier könnte Routing/Global-Model/Busy-Indicator liegen.
 */
sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function(Controller: any) {
  "use strict";

  return Controller.extend("buecherverwaltung.controller.App", {
    onInit: function() {
      // Intentionally left minimal.
    }
  });
});
