# 29th Company Wardroom Store

A digital honor-system store for USNA 29th Company. Midshipmen scan a QR code, select items, and pay via Venmo. Every order is automatically logged to a Google Sheet for weekly reconciliation and MWF deposit prep.

---

## How it works

```
Midshipman scans QR code
        ↓
Selects items + enters alpha
        ↓
Submits order → logged to Google Sheet
        ↓
Confirmation screen shows Venmo handle + amount + pre-filled note
        ↓
Midshipman pays via Venmo immediately
        ↓
Supply Officer reconciles Sheet vs. Venmo weekly → deposits to MWF
```

---

## Files

| File | Purpose |
|---|---|
| `Code.gs` | Google Apps Script backend — handles form submissions, writes rows to the Orders sheet, serves the web app |
| `index.html` | Customer-facing order form — multi-item cart, qty controls, Venmo confirmation screen |

---

## Setup

### Prerequisites
- A Google account (USNA Google account works)
- A Google Sheet to store orders
- A Venmo account for the wardroom

### 1. Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it **29th Company Wardroom Store**

### 2. Open Apps Script from inside the Sheet
1. Click **Extensions → Apps Script**
2. This creates a script *bound* to your sheet — required for `SpreadsheetApp.getActiveSpreadsheet()` to work
> ⚠️ Do not go to script.google.com directly — the script must be opened from inside the Sheet

### 3. Add Code.gs
1. Delete all default content in `Code.gs`
2. Paste the contents of `Code.gs` from this repo
3. Update these two lines at the top:
```js
const VENMO_HANDLE = "@YourVenmoHandle";
```
4. Edit `CATALOG` to match your actual inventory and prices

### 4. Add index.html
1. Click **+** next to Files → select **HTML**
2. Name it exactly `index` — no `.html` extension (Apps Script adds it automatically)
3. Delete all default content and paste the contents of `index.html` from this repo

### 5. Authorize the script
1. Select `doGet` from the function dropdown
2. Click **Run (▶)**
3. Click **Review permissions → Advanced → Go to project (unsafe) → Allow**

### 6. Deploy as a web app
1. Click **Deploy → New deployment**
2. Click the gear icon → **Web app**
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone *(not "Anyone with a Google account")*
4. Click **Deploy**
5. Copy the URL ending in `/exec`

### 7. Generate the QR code
1. Take your `/exec` URL and append `?embedded=true`:
```
https://script.google.com/macros/s/YOUR_ID/exec?embedded=true
```
2. Go to [goqr.me](https://goqr.me) or [qr.io](https://qr.io)
3. Paste the full URL and download the QR code as PNG
4. Print, laminate, and post in the wardroom next to the items

> The `?embedded=true` parameter is required for iPhone Safari compatibility

---

## Updating items or prices

1. Open Apps Script → `Code.gs`
2. Edit the `CATALOG` object:
```js
const CATALOG = {
  wb: { name: "Water bottle", price: 1.00, category: "Drinks" },
  gt: { name: "Gatorade",     price: 1.75, category: "Drinks" },
  // add a new item:
  lf: { name: "Lays Flamin Hot", price: 1.75, category: "Snacks" },
};
```
3. **Deploy → Manage deployments → pencil icon → New version → Deploy**
4. The form updates automatically — QR code stays the same

---

## Orders Sheet columns

| Column | Source | Who fills it |
|---|---|---|
| Timestamp | Auto | Read-only |
| Alpha / Name | Customer | Read-only |
| Items Ordered | Auto-calculated | Read-only |
| Qty Breakdown | Auto-calculated | Read-only |
| Total ($) | Auto-calculated | Read-only |
| Venmo Note | Auto-generated | Read-only |
| Venmo Status | Manual | You — "Pending" → "Confirmed" or "No payment" |
| Confirmed By | Manual | Your name when verified |
| Notes | Customer (optional) | Read-only |

---

## Weekly reconciliation

1. Open the Orders Sheet
2. Open your Venmo transaction history
3. For each **Pending** row, find the matching Venmo payment by searching the customer's alpha
   - Match found → set Venmo Status to **Confirmed**, add your name to Confirmed By
   - No payment after 3+ days → follow up with that midshipman
4. Sum the Total ($) column for all Confirmed rows
5. Withdraw that amount from Venmo → bring cash to MWF office
6. Email lassen@usna.edu with total amount, purpose ("WS sales"), and your Navy Fed account name

---

## MWF compliance notes

- Venmo is used for collection between midshipmen only — all funds must be converted to cash or check before depositing to MWF
- Collected funds cannot be held over winter, spring, or summer break — deposit before leave
- Checks made payable to **"Midshipman Welfare Fund"** with company name in memo line
- Navy Federal members can transfer directly to MWF (lassen@usna.edu, account ends -5705)
- Keep exported CSV records in your turnover binder for each academic year
- All organizations subject to audit by CNIC

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Cannot read properties of null (reading 'getSheetByName')` | Script is not bound to a Sheet | Open Apps Script from Extensions → Apps Script inside your Google Sheet, not from script.google.com |
| `Cannot read properties of undefined (reading 'cart')` | Running `submitOrder` manually from editor | Never run `submitOrder` from the editor — use `testSubmitOrder` instead or test via the live form |
| Google Drive error on phone | Wrong deployment settings | Set "Who has access" to **Anyone** (not "Anyone with a Google account"), redeploy as new version |
| iPhone Safari won't open link | Safari cross-site tracking block | Add `?embedded=true` to the end of your `/exec` URL |
| QR code opens wrong page | QR encodes wrong URL | Copy URL from browser address bar after form loads, not from Apps Script deployment page |

---

## Testing without the form

Add this to the bottom of `Code.gs`, run it from the editor to verify the Sheet connection, then delete it:

```js
function testSubmitOrder() {
  const fakePayload = {
    alpha: "3/C Smith",
    cart: { wb: 2, ch: 1 },
    notes: "test order"
  };
  const result = submitOrder(fakePayload);
  Logger.log(result);
}
```

---

## Contact

**29th Company Supply Officer**
Maintained by the MIDN Treasurer each academic year. Update `VENMO_HANDLE` and `CATALOG` at turnover.

> Built to comply with USNA MWF procurement procedures (CMDT 1500.1 Series: Company Wardroom) and COMDTMIDNINST 7041.
