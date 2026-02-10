// ---- DELETE EVERYTHING IN Code.gs AND PASTE ONLY THIS ----

var SHEET_ID = '1k9gomK3YaXvBfrqfxCznrbbSmQjpNoJnFZPndG8O_gI';

function doPost(e) {
  try {
    var p = e.parameter;

    function clean(val) {
      return String(val || '').replace(/<[^>]*>/g, '').trim().substring(0, 500);
    }

    // Determine which sheet to use based on sheetName parameter
    var targetSheetName = p.sheetName === 'audit' ? 'audit' : 'Sheet1';
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(targetSheetName);

    // Route to appropriate handler based on sheet
    if (targetSheetName === 'audit') {
      // Audit form: email, phone, brand, siteUrl, platform, adSpend, businessType
      sheet.appendRow([
        new Date().toISOString(),
        clean(p.email),
        clean(p.phone),
        clean(p.brand),
        clean(p.siteUrl),
        clean(p.platform),
        clean(p.adSpend),
        clean(p.businessType)
      ]);
    } else {
      // Main form: email, phone, brand, adSpend, businessType
      sheet.appendRow([
        new Date().toISOString(),
        clean(p.email),
        clean(p.phone),
        clean(p.brand),
        clean(p.adSpend),
        clean(p.businessType)
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', sheet: targetSheetName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
