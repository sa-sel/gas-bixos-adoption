export const app = SpreadsheetApp;
export const ss = app.getActiveSpreadsheet();
export const ui = SpreadsheetApp.getUi();
export const masterSheet = ss.getSheetByName('Lista dos Meliantes');
export const bixosDB = ss.getSheetByName('DB - Bixos');
export const veteranosDB = ss.getSheetByName('DB - Veteranos');
