// Demo data used when backend endpoints aren't available.

export const DEMO_CLIENTS = [
  {
    id: "horizon-pension",
    name: "Horizon Pension Fund LP",
    segment: "Pension Fund",
    aum: 2.4e9,
    objective: ["Conservative Growth", "Income Focus", "Low Volatility"],
  },
  {
    id: "atlas-family",
    name: "Atlas Family Office",
    segment: "Family Office",
    aum: 0.85e9,
    objective: ["Balanced Growth", "Tax Efficiency", "ESG Aligned"],
  },
];

export const DEMO_HOLDINGS = {
  "horizon-pension": {
    summary: { totalValue: 93520570, positions: 10 },
    rows: [
      ["AAPL", "Apple Inc.", "Technology", 95000, 182.52, 17339400, "18.5%"],
      ["MSFT", "Microsoft Corporation", "Technology", 38000, 398.45, 15141100, "16.2%"],
      ["JNJ", "Johnson & Johnson", "Healthcare", 75000, 159.82, 11986500, "12.8%"],
      ["JPM", "JPMorgan Chase & Co.", "Financials", 58000, 169.23, 9815340, "10.5%"],
      ["PG", "Procter & Gamble", "Consumer Staples", 61000, 150.12, 9157320, "9.8%"],
      ["V", "Visa Inc.", "Financials", 33000, 237.89, 7850370, "8.4%"],
      ["XOM", "Exxon Mobil", "Energy", 68000, 98.76, 6715680, "7.2%"],
      ["KO", "Coca–Cola", "Consumer Staples", 110000, 58.65, 6451500, "6.9%"],
      ["DIS", "Walt Disney Co.", "Communication Services", 55000, 93.42, 5138100, "5.5%"],
      ["WMT", "Walmart Inc.", "Consumer Discretionary", 27000, 145.38, 3925260, "4.2%"],
    ],
  },
  "atlas-family": {
    summary: { totalValue: 850000000, positions: 18 },
    rows: [],
  },
};

export const DEMO_AGENTS_PROGRESS = [
  { name: "Research Agent", status: "done", note: "Analyzed market data and fundamentals" },
  { name: "Risk Agent", status: "processing", note: "Evaluating portfolio risk metrics" },
  { name: "Portfolio Construction Agent", status: "todo", note: "Optimizing allocations" },
  { name: "Execution Agent", status: "todo", note: "Generating trade recommendations" },
  { name: "Compliance Agent", status: "todo", note: "Validating regulatory requirements" },
];

export const DEMO_RESULTS = {
  score: 82,
  risk: {
    beta: 0.87,
    sharpe: 1.42,
    vol: "11.3%",
    mdd: "-8.7%",
  },
  compliance: [
    { label: "Concentration Limits", status: "PASS", note: "All single-stock positions within 20% limit" },
    { label: "Sector Diversification", status: "PASS", note: "Sector weights comply with mandate guidelines" },
    { label: "ESG Screening", status: "WARNING", note: "XOM flagged for fossil fuel exposure; consider reduction" },
  ],
  sectorExposure: {
    labels: [
      "Technology","Healthcare","Financials","Consumer Staples","Energy",
      "Communication Services","Consumer Discretionary"
    ],
    current: [36, 27, 18, 20, 6, 5, 8],
    target:  [32, 24, 16, 18, 5, 6, 9],
  },
};

export const DEMO_ORDERS = [
  { ticker: "AAPL", action: "SELL", qty: 15000, price: 182.52, urgency: "MEDIUM",
    rationale: "Reduce overweight Technology exposure; valuation stretched" },
  { ticker: "JNJ", action: "BUY", qty: 12000, price: 159.82, urgency: "LOW",
    rationale: "Increase defensive Healthcare allocation; attractive dividend yield" },
  { ticker: "VZ",  action: "BUY", qty: 25000, price: 38.47, urgency: "MEDIUM",
    rationale: "Add Telecom exposure; high yield supports income objective" },
  { ticker: "XOM", action: "SELL", qty: 8000, price: 98.76, urgency: "LOW",
    rationale: "Trim Energy to meet ESG guidelines; sector rotation" },
];
