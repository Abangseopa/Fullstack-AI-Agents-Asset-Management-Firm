import {
  DEMO_CLIENTS,
  DEMO_HOLDINGS,
  DEMO_AGENTS_PROGRESS,
  DEMO_RESULTS,
  DEMO_ORDERS,
} from "./demoData.js";

/** Config */
const API_BASE = ""; // e.g. "http://localhost:8000"
const APP_VERSION = "v0.1 demo";

/** Utilities */
const $ = (sel) => document.querySelector(sel);
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Simple state */
const state = {
  client: null,
  holdings: null,
  results: null,
  orders: null,
};

/** API with graceful fallback to demo */
async function apiGet(path, fallback) {
  if (!API_BASE) return fallback;
  try {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error("Bad status");
    return await res.json();
  } catch {
    return fallback;
  }
}
async function apiPost(path, body, fallback) {
  if (!API_BASE) return fallback;
  try {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error("Bad status");
    return await res.json();
  } catch {
    return fallback;
  }
}

/** Views */
function render() {
  $("#app").innerHTML = ROUTES[route.path]();
  bindEvents[route.path]?.();
}

const ROUTES = {
  "/": () => viewClientSelect(),
  "/portfolio": () => viewPortfolio(),
  "/agents": () => viewAgents(),
  "/results": () => viewResults(),
};

const route = {
  path: "/",
  go(p) {
    this.path = p;
    render();
  },
};

/** View 1: Client selection */
function viewClientSelect() {
  const cards = (clients) =>
    clients
      .map(
        (c) => `
      <div class="border rounded-xl bg-white p-5 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-slate-900 text-white grid place-items-center">🏛️</div>
          <div class="flex-1">
            <div class="font-semibold">${c.name}</div>
            <div class="text-xs text-slate-500">${c.segment}</div>
            <div class="mt-4 text-xs">
              <div class="text-slate-500">Assets Under Management</div>
              <div class="font-semibold">${fmtUSD(c.aum)}</div>
            </div>
            <div class="mt-3 text-xs text-slate-600">
              <span class="font-medium">Investment Objective</span>
              <span class="ml-2">${c.objective.join(" • ")}</span>
            </div>
          </div>
        </div>
        <button
          class="mt-5 w-full px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 transition"
          data-id="${c.id}"
        >
          View Portfolio
        </button>
      </div>`
      )
      .join("");

  return `
    <section>
      <h2 class="text-lg font-semibold mb-2">Select Client Account</h2>
      <p class="text-sm text-slate-500 mb-6">
        Choose a client portfolio to analyze and generate AI-driven recommendations.
      </p>
      <div class="grid md:grid-cols-2 gap-6" id="clientCards">
        ${cards(DEMO_CLIENTS)}
      </div>
    </section>
  `;
}

/** View 2: Portfolio holdings */
function viewPortfolio() {
  const c = state.client;
  if (!c) return `<div class="text-sm">No client selected.</div>`;

  const h = state.holdings?.[c.id] ?? DEMO_HOLDINGS[c.id];
  const rows = h.rows
    .map(
      (r) => `
      <tr class="border-b">
        <td class="py-2 font-mono text-xs">${r[0]}</td>
        <td class="py-2">${r[1]}</td>
        <td class="py-2 text-slate-600">${r[2]}</td>
        <td class="py-2 text-right">${fmtNum(r[3])}</td>
        <td class="py-2 text-right">$${r[4].toFixed(2)}</td>
        <td class="py-2 text-right">${fmtUSD(r[5])}</td>
        <td class="py-2 text-right">${r[6]}</td>
      </tr>`
    )
    .join("");

  return `
    <section>
      <div class="flex items-start gap-3 mb-4">
        <button id="backToClients" class="text-slate-500 hover:text-slate-700 text-sm">← Back</button>
        <div>
          <h2 class="text-lg font-semibold">${c.name}</h2>
          <div class="text-xs text-slate-500">${c.objective.join(" • ")}</div>
        </div>
        <div class="ml-auto flex items-center gap-6 text-sm">
          <div>
            <div class="text-slate-500">Total Portfolio Value</div>
            <div class="font-semibold">${fmtUSD(h.summary.totalValue)}</div>
          </div>
          <div>
            <div class="text-slate-500">Number of Holdings</div>
            <div class="font-semibold">${h.summary.positions}</div>
          </div>
          <button
            id="runAgents"
            class="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 transition"
          >
            ▶ Run AI Agents Cycle
          </button>
        </div>
      </div>

      <div class="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr class="text-left">
              <th class="py-2 px-4">Ticker</th>
              <th class="py-2 px-2">Company</th>
              <th class="py-2 px-2">Sector</th>
              <th class="py-2 px-2 text-right">Shares</th>
              <th class="py-2 px-2 text-right">Price</th>
              <th class="py-2 px-2 text-right">Value</th>
              <th class="py-2 px-4 text-right">Weight</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${rows}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/** View 3: Agents running */
function viewAgents() {
  const steps = DEMO_AGENTS_PROGRESS
    .map((s, i) => {
      let badge =
        s.status === "done"
          ? `<span class="w-5 h-5 rounded-full bg-emerald-600 text-white grid place-items-center">✓</span>`
          : s.status === "processing"
          ? `<span class="w-5 h-5 rounded-full border-2 border-slate-400 grid place-items-center">•</span>`
          : `<span class="w-5 h-5 rounded-full border border-slate-300"></span>`;
      let titleClass =
        s.status === "done"
          ? "text-slate-900"
          : s.status === "processing"
          ? "text-slate-900"
          : "text-slate-400";
      return `
      <div class="flex items-start gap-3 ${i ? "mt-4" : ""}">
        ${badge}
        <div>
          <div class="font-medium ${titleClass}">${s.name}</div>
          <div class="text-xs text-slate-500">${s.note}</div>
        </div>
      </div>`;
    })
    .join("");

  return `
    <section class="max-w-3xl">
      <h2 class="text-lg font-semibold mb-1">Running AI Analysis</h2>
      <p class="text-sm text-slate-500 mb-6">Multiple AI agents are analyzing your portfolio</p>

      <div class="bg-white border rounded-xl p-6 shadow-sm">
        ${steps}
        <div class="mt-8 text-center text-xs text-slate-500">
          This typically takes 30–60 seconds depending on portfolio complexity
        </div>
      </div>
    </section>
  `;
}

/** View 4: Results + orders */
function viewResults() {
  const r = state.results ?? DEMO_RESULTS;
  const orders = (state.orders ?? DEMO_ORDERS)
    .map(
      (o) => `
      <tr class="border-b">
        <td class="py-2 font-mono text-xs">${o.ticker}</td>
        <td class="py-2">
          <span class="px-2 py-1 rounded text-xs ${
            o.action === "BUY" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }">${o.action}</span>
        </td>
        <td class="py-2 text-right">${fmtNum(o.qty)}</td>
        <td class="py-2 text-right">$${o.price.toFixed(2)}</td>
        <td class="py-2">
          <span class="px-2 py-1 rounded text-xs ${
            o.urgency === "HIGH"
              ? "bg-rose-100 text-rose-700"
              : o.urgency === "MEDIUM"
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-700"
          }">${o.urgency}</span>
        </td>
        <td class="py-2 text-slate-700">${o.rationale}</td>
      </tr>`
    )
    .join("");

  const complianceRows = r.compliance
    .map(
      (c) => `
    <div class="flex items-start gap-3 py-3 border-b last:border-0">
      <div>${
        c.status === "PASS"
          ? "✅"
          : c.status === "WARNING"
          ? "⚠️"
          : "ℹ️"
      }</div>
      <div>
        <div class="text-sm font-medium">${c.label} <span class="ml-2 text-xs px-2 py-0.5 rounded bg-slate-100">${c.status}</span></div>
        <div class="text-xs text-slate-500">${c.note}</div>
      </div>
    </div>`
    )
    .join("");

  // layout
  return `
    <section class="space-y-6">
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white border rounded-xl p-5 shadow-sm">
          <div class="text-sm text-slate-500">Overall Portfolio Score</div>
          <div class="mt-3 text-4xl font-extrabold text-emerald-600">${r.score}<span class="text-slate-300 text-2xl"> / 100</span></div>
          <div class="mt-2 text-xs text-slate-500">Excellent alignment with objectives</div>
        </div>

        <div class="bg-white border rounded-xl p-5 shadow-sm">
          <div class="text-sm text-slate-500">Risk Metrics</div>
          <div class="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div class="text-slate-500">Portfolio Beta</div><div class="text-right font-medium">${r.risk.beta}</div>
            <div class="text-slate-500">Sharpe Ratio</div><div class="text-right font-medium">${r.risk.sharpe}</div>
            <div class="text-slate-500">Volatility</div><div class="text-right font-medium">${r.risk.vol}</div>
            <div class="text-slate-500">Max Drawdown</div><div class="text-right font-medium">${r.risk.mdd}</div>
          </div>
        </div>

        <div class="bg-white border rounded-xl p-5 shadow-sm">
          <div class="text-sm text-slate-500">Compliance Status</div>
          <div class="mt-3">${complianceRows}</div>
        </div>
      </div>

      <div class="bg-white border rounded-xl p-5 shadow-sm">
        <div class="text-sm text-slate-500 mb-3">Sector Exposure: Current vs Target</div>
        <canvas id="sectorChart" height="110"></canvas>
      </div>

      <div class="bg-white border rounded-xl p-5 shadow-sm">
        <div class="text-sm text-slate-500 mb-3">Proposed Orders</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr class="text-left">
                <th class="py-2 px-4">Ticker</th>
                <th class="py-2 px-2">Action</th>
                <th class="py-2 px-2 text-right">Quantity</th>
                <th class="py-2 px-2 text-right">Price</th>
                <th class="py-2 px-2">Urgency</th>
                <th class="py-2 px-4">Rationale</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${orders}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

/** Event bindings per view */
const bindEvents = {
  "/": () => {
    $("#appVersion").textContent = APP_VERSION;
    $("#clientCards").addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-id]");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      state.client = DEMO_CLIENTS.find((x) => x.id === id);
      // fetch holdings (with fallback)
      state.holdings = await apiGet(`/portfolio/${id}`, DEMO_HOLDINGS);
      route.go("/portfolio");
    });
  },

  "/portfolio": () => {
    $("#backToClients").onclick = () => route.go("/");
    $("#runAgents").onclick = async () => {
      route.go("/agents");
      // Simulate pipeline (or hit backend)
      await sleep(1200);
      await apiPost("/agents/run", { client_id: state.client.id }, null);
      // Fetch results + orders (or fallback)
      state.results = await apiGet(`/results?client_id=${state.client.id}`, DEMO_RESULTS);
      state.orders = await apiGet(`/orders/proposed?client_id=${state.client.id}`, DEMO_ORDERS);
      route.go("/results");
    };
  },

  "/agents": () => {
    // nothing to bind here in demo
  },

  "/results": () => {
    const r = state.results ?? DEMO_RESULTS;
    const ctx = document.getElementById("sectorChart");
    const data = {
      labels: r.sectorExposure.labels,
      datasets: [
        { label: "Current", data: r.sectorExposure.current },
        { label: "Target", data: r.sectorExposure.target },
      ],
    };
    new Chart(ctx, {
      type: "bar",
      data,
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 5 } },
        },
      },
    });
  },
};

/** Boot */
render();
