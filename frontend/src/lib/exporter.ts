import type { Property } from "../data/types";
import { sourceUrl } from "../store/logic";

export type ExportFormat = "csv" | "xls" | "json" | "pdf";

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime + ";charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

const CLIENT_AGENCY  = "Rayash Real Estate";
const CLIENT_PHONE   = "+966 50 123 4567";  // replace with real number

/** Whitelabel export: removes original listing URL, replaces broker with Rayash branding. */
export function downloadListingsForClient(fmt: ExportFormat, list: Property[]) {
  if (!list.length) return;
  const rows = list.map((p) => ({
    Ref: "PS-" + p.id,
    Title: p.title,
    Type: p.type,
    Purpose: p.purpose === "Sale" ? "For Sale" : "For Rent",
    Status: p.status,
    City: p.city,
    District: p.district,
    Beds: p.beds || 0,
    Baths: p.baths || 0,
    "Area (m2)": p.area,
    "Price (SAR)": p.priceFull || p.price,
    Agent: CLIENT_AGENCY,
    Phone: CLIENT_PHONE,
  }));
  const headers = Object.keys(rows[0]) as Array<keyof (typeof rows)[0]>;
  const fname = "rayash-listings";

  if (fmt === "json") {
    triggerDownload(JSON.stringify(rows, null, 2), fname + ".json", "application/json");
    return;
  }

  if (fmt === "csv" || fmt === "xls") {
    const esc = (v: unknown) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const sep = fmt === "xls" ? "\t" : ",";
    const content = [headers.join(sep)].concat(rows.map((r) => headers.map((h) => esc(r[h])).join(sep))).join("\n");
    const mime = fmt === "xls" ? "application/vnd.ms-excel" : "text/csv";
    triggerDownload(content, fname + (fmt === "xls" ? ".xls" : ".csv"), mime);
    return;
  }

  // pdf → printable HTML
  const html =
    '<html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;padding:24px;color:#0A0A0A}h1{font-size:20px;margin-bottom:4px}h2{font-size:13px;font-weight:normal;color:#6B7280;margin:0 0 16px}table{border-collapse:collapse;width:100%;font-size:12px;margin-top:12px}th,td{border:1px solid #E5E7EB;padding:6px 8px;text-align:left}th{background:#F3F4F6}</style></head><body>' +
    '<h1>Rayash Real Estate — Property Listings</h1>' +
    '<h2>Contact: ' + CLIENT_PHONE + '</h2>' +
    "<table><thead><tr>" +
    headers.map((h) => "<th>" + h + "</th>").join("") +
    "</tr></thead><tbody>" +
    rows.map((r) => "<tr>" + headers.map((h) => "<td>" + String(r[h] == null ? "" : r[h]) + "</td>").join("") + "</tr>").join("") +
    "</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>";
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

/** Export a list of listings as CSV / Excel / JSON / PDF (print). */
export function downloadListings(fmt: ExportFormat, list: Property[]) {
  if (!list.length) return;
  const rows = list.map((p) => ({
    Ref: "PS-" + p.id,
    Title: p.title,
    Type: p.type,
    Purpose: p.purpose === "Sale" ? "For Sale" : "For Rent",
    Status: p.status,
    City: p.city,
    District: p.district,
    Beds: p.beds || 0,
    Baths: p.baths || 0,
    "Area (m2)": p.area,
    "Price (SAR)": p.priceFull || p.price,
    Source: p.source,
    Link: sourceUrl(p),
  }));
  const headers = Object.keys(rows[0]) as Array<keyof (typeof rows)[0]>;
  const fname = "propscan-listings";

  if (fmt === "json") {
    triggerDownload(JSON.stringify(rows, null, 2), fname + ".json", "application/json");
    return;
  }

  if (fmt === "csv" || fmt === "xls") {
    const esc = (v: unknown) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const sep = fmt === "xls" ? "\t" : ",";
    const content = [headers.join(sep)].concat(rows.map((r) => headers.map((h) => esc(r[h])).join(sep))).join("\n");
    const mime = fmt === "xls" ? "application/vnd.ms-excel" : "text/csv";
    triggerDownload(content, fname + (fmt === "xls" ? ".xls" : ".csv"), mime);
    return;
  }

  // pdf -> printable HTML window
  const html =
    '<html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;padding:24px;color:#0A0A0A}h1{font-size:20px}table{border-collapse:collapse;width:100%;font-size:12px;margin-top:12px}th,td{border:1px solid #E5E7EB;padding:6px 8px;text-align:left}th{background:#F3F4F6}a{color:#15803D}</style></head><body><h1>PropScan — Listings Export</h1>' +
    "<table><thead><tr>" +
    headers.map((h) => "<th>" + h + "</th>").join("") +
    "</tr></thead><tbody>" +
    rows
      .map(
        (r) =>
          "<tr>" +
          headers.map((h) => (h === "Link" ? '<td><a href="' + r[h] + '">' + r.Source + " link</a></td>" : "<td>" + String(r[h] == null ? "" : r[h]) + "</td>")).join("") +
          "</tr>",
      )
      .join("") +
    "</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>";
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
