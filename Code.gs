// ============================================================
// 29th Company Wardroom Store — Google Apps Script Backend
// Paste this entire file into your Apps Script project (Code.gs)
// ============================================================

// --- CONFIGURATION — edit these ---
const SHEET_NAME = "29th Company Wardroom Store";
const VENMO_HANDLE = "@Nicolas-Simmons-2";

// Item catalog: key -> { name, price, category }
const CATALOG = {
  wb: { name: "Water bottle",   price: 1.00, category: "Drinks"          },
  gt: { name: "Gatorade",       price: 1.75, category: "Drinks"          },
  ed: { name: "Energy drink",   price: 2.00, category: "Drinks"          },
  ch: { name: "Chips",          price: 1.50, category: "Snacks"          },
  cb: { name: "Candy bar",      price: 1.25, category: "Snacks"          },
  rm: { name: "Ramen cup",      price: 1.00, category: "Snacks"          },
  ic: { name: "Ice cream cup",  price: 1.25, category: "Frozen"          },
  pp: { name: "Printer paper",  price: 0.10, category: "School supplies" },
};

// ============================================================
// doGet — serves the order form webpage
// ============================================================
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setTitle("29th Company Wardroom Store")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// submitOrder — called from the frontend via google.script.run
// Writes one row to the Orders sheet
// ============================================================
function submitOrder(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet + header row if it doesn't exist yet
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Alpha / Name",
      "Items Ordered",
      "Qty Breakdown",
      "Total ($)",
      "Venmo Note",
      "Venmo Status",
      "Confirmed By",
      "Notes"
    ]);
    // Freeze header row
    sheet.setFrozenRows(1);
    // Bold header
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
    // Set column widths
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 130);
    sheet.setColumnWidth(3, 260);
    sheet.setColumnWidth(4, 200);
    sheet.setColumnWidth(5, 80);
    sheet.setColumnWidth(6, 260);
    sheet.setColumnWidth(7, 110);
    sheet.setColumnWidth(8, 110);
    sheet.setColumnWidth(9, 160);
  }

  // Build display strings from cart
  const cart = payload.cart; // { key: qty, ... }
  const itemLines = [];
  const qtyBreakdown = [];
  let total = 0;

  for (const [key, qty] of Object.entries(cart)) {
    if (qty > 0 && CATALOG[key]) {
      const item = CATALOG[key];
      const sub = item.price * qty;
      total += sub;
      itemLines.push(`${item.name} ×${qty}`);
      qtyBreakdown.push(`${item.name}: ${qty} @ $${item.price.toFixed(2)} = $${sub.toFixed(2)}`);
    }
  }

  const itemsStr    = itemLines.join(", ");
  const qtyStr      = qtyBreakdown.join(" | ");
  const totalStr    = total.toFixed(2);
  const venmoNote   = `${payload.alpha} | ${itemsStr} | $${totalStr}`;
  const timestamp   = new Date();

  sheet.appendRow([
    timestamp,
    payload.alpha,
    itemsStr,
    qtyStr,
    parseFloat(totalStr),
    venmoNote,
    "Pending",
    "",
    payload.notes || ""
  ]);

  // Return data back to frontend for confirmation screen
  return {
    success:    true,
    total:      totalStr,
    items:      itemsStr,
    venmoNote:  venmoNote,
    venmoHandle: VENMO_HANDLE,
    timestamp:  timestamp.toLocaleString()
  };
}

// ============================================================
// getCatalog — called on page load so frontend stays in sync
// with whatever you edit in CATALOG above
// ============================================================
function getCatalog() {
  return CATALOG;
}
