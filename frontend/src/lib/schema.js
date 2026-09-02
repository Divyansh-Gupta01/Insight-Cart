// Sample dataset generator + column schema.
// Kept in one place so the "See required schema" dialog and the
// "Download sample dataset" both stay in sync with the backend contract.

export const SCHEMA = [
  {
    column: "date",
    required: true,
    type: "date or datetime",
    example: "2025-05-01 or 2025-05-01 14:30:00",
    powers: ["Overview KPIs (Revenue, Orders)", "Sales Over Time charts", "Trends & Heatmaps", "7-Day Walk-Forward Forecast"],
  },
  {
    column: "product",
    required: true,
    type: "text",
    example: "Amul Gold Milk 1L",
    powers: ["SKU Demand Forecasting", "Action Center Alerts", "Inventory Table", "Top Products Ranking"],
  },
  {
    column: "category",
    required: true,
    type: "text",
    example: "Dairy & Refrigerated",
    powers: ["Sales by Category Mix", "Inventory Department Filter", "Business Performance Breakdown"],
  },
  {
    column: "quantity",
    required: true,
    type: "integer",
    example: "2",
    powers: ["Unit Sales Velocity", "Demand Volume Analysis", "Basket Size Aggregations"],
  },
  {
    column: "amount",
    required: true,
    type: "number (INR)",
    example: "136.00",
    powers: ["Total Store Revenue", "Average Order Value (AOV)", "Sales Trends", "Revenue Forecasting"],
  },
  {
    column: "current_stock",
    required: true,
    type: "integer",
    example: "14",
    powers: ["Live Shelf Stock Tracking", "Mathematical Stockout Date Simulation", "RESTOCK / REDUCE Decision Priorities"],
  },
  {
    column: "unit_cost",
    required: false,
    type: "number (INR)",
    example: "52.00",
    powers: ["Gross Profit Calculation", "True Profit Margin %", "Pareto ABC Class (Gross Profit Contribution)"],
  },
  {
    column: "lead_time_days",
    required: false,
    type: "integer",
    example: "2",
    powers: ["Supplier Restock Lead Time", "Reorder Point (ROP)", "Safety Stock (SS) Buffer. Defaults to 3d."],
  },
  {
    column: "reorder_level",
    required: false,
    type: "integer",
    example: "40",
    powers: ["Minimum Shelf Threshold. Auto-computed from ROP if omitted."],
  },
  {
    column: "payment_method",
    required: false,
    type: "text",
    example: "UPI / QR",
    powers: ["Payment Breakdown (UPI, Cards, Cash). Defaults to UPI if omitted."],
  },
  {
    column: "invoice_id",
    required: false,
    type: "text",
    example: "INV-20250101",
    powers: ["Basket Size Aggregation & Multi-Item Order Tracking"],
  },
];

// Sample products with realistic Indian retail data.
const PRODUCTS = [
  { p: "Amul Gold Milk 1L", c: "Dairy", price: 62, stock: 42, reorder: 60 },
  { p: "Lay's Classic 52g", c: "Snacks", price: 30, stock: 320, reorder: 200 },
  { p: "Coca Cola 750ml", c: "Beverages", price: 40, stock: 12, reorder: 80 },
  { p: "Aashirvaad Atta 5kg", c: "Others", price: 260, stock: 88, reorder: 40 },
  { p: "Maggi 2-Min Noodles", c: "Snacks", price: 20, stock: 0, reorder: 100 },
  { p: "Tata Salt 1kg", c: "Others", price: 28, stock: 240, reorder: 100 },
  { p: "Britannia Bread", c: "Bakery", price: 45, stock: 8, reorder: 40 },
  { p: "Fortune Sunflower Oil 1L", c: "Others", price: 175, stock: 155, reorder: 60 },
  { p: "Dettol Handwash 200ml", c: "Personal Care", price: 90, stock: 22, reorder: 50 },
  { p: "Colgate MaxFresh 150g", c: "Personal Care", price: 95, stock: 90, reorder: 40 },
  { p: "Nescafe Classic 100g", c: "Beverages", price: 320, stock: 34, reorder: 50 },
  { p: "Onions 1kg", c: "Fruits & Vegetables", price: 45, stock: 3, reorder: 40 },
  { p: "Tomatoes 1kg", c: "Fruits & Vegetables", price: 40, stock: 210, reorder: 40 },
  { p: "Mother Dairy Curd 400g", c: "Dairy", price: 55, stock: 18, reorder: 50 },
  { p: "Bisleri Water 1L", c: "Beverages", price: 20, stock: 900, reorder: 200 },
];

const PAYMENTS = ["UPI", "UPI", "UPI", "UPI", "Credit/Debit Card", "Credit/Debit Card", "Credit/Debit Card", "Cash on Delivery", "Cash on Delivery", "Net Banking"];

// Seeded deterministic pseudo-random so the same sample is generated each time.
function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, "0");

export function generateSampleCSV() {
  const rnd = mulberry32(42);
  const rows = [
    ["date", "product", "category", "quantity", "amount", "payment_method", "current_stock", "reorder_level"],
  ];

  // 31 days × ~7 transactions/day
  for (let day = 1; day <= 31; day++) {
    // Weekend boost
    const jsDate = new Date(2025, 4, day);
    const weekend = jsDate.getDay() === 0 || jsDate.getDay() === 6;
    const txCount = weekend ? 10 : 6;

    for (let t = 0; t < txCount; t++) {
      const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      const qty = 1 + Math.floor(rnd() * 5);
      const hour = 8 + Math.floor(rnd() * 14); // 08:00 – 21:00
      const minute = Math.floor(rnd() * 60);
      const pay = PAYMENTS[Math.floor(rnd() * PAYMENTS.length)];
      const amount = qty * p.price;
      rows.push([
        `2025-05-${pad(day)} ${pad(hour)}:${pad(minute)}`,
        p.p, p.c, qty, amount, pay, p.stock, p.reorder,
      ]);
    }
  }

  return rows.map((r) => r.map((cell) => {
    const s = String(cell);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n");
}

export function downloadSampleCSV() {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cart-insight-sample-dataset.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
