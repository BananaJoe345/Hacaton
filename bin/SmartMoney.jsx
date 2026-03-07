import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════
//  IN-MEMORY STORE — simulează baza de date
// ═══════════════════════════════════════════════════════════
const initialUsers = [
  { id: 1, username: "ion.popescu", email: "ion@example.com", fullName: "Ion Popescu", passwordHash: "hashed" }
];

const initialAccounts = [
  { id: 1, userId: 1, name: "Cont Curent BRD", type: "CHECKING", balance: 2020, currency: "RON" },
  { id: 2, userId: 1, name: "Economii ING",    type: "SAVINGS",  balance: 1500, currency: "RON" },
];

const initialTransactions = [
  { id: 1, accountId: 1, type: "INCOME",  amount: 4500, category: "Salariu",       description: "Salariu luna curenta",     date: "2025-03-01" },
  { id: 2, accountId: 1, type: "EXPENSE", amount: 1200, category: "Chirie",         description: "Chirie apartament",        date: "2025-03-05" },
  { id: 3, accountId: 1, type: "EXPENSE", amount: 350,  category: "Alimente",       description: "Cumparaturi saptamanale",  date: "2025-03-08" },
  { id: 4, accountId: 1, type: "EXPENSE", amount: 150,  category: "Transport",      description: "Benzina + parcare",        date: "2025-03-10" },
  { id: 5, accountId: 1, type: "EXPENSE", amount: 200,  category: "Divertisment",   description: "Restaurante + cinema",     date: "2025-03-15" },
  { id: 6, accountId: 1, type: "EXPENSE", amount: 80,   category: "Utilitati",      description: "Electricitate + gaz",     date: "2025-03-20" },
  { id: 7, accountId: 1, type: "TRANSFER",amount: 500,  category: "Transfer",       description: "Economii lunare",          date: "2025-03-22" },
  { id: 8, accountId: 2, type: "INCOME",  amount: 500,  category: "Transfer",       description: "Transfer primit",          date: "2025-03-22" },
];

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════
const CATEGORY_COLORS = {
  Salariu:      "#4ade80", Chirie:       "#f87171", Alimente:    "#fb923c",
  Transport:    "#60a5fa", Divertisment: "#c084fc", Utilitati:   "#fbbf24",
  Transfer:     "#94a3b8", Sanatate:     "#34d399", Educatie:    "#a78bfa",
  Necategorizat:"#64748b",
};
const TYPE_ICON = { INCOME: "↑", EXPENSE: "↓", TRANSFER: "⇄" };
const TYPE_COLOR = { INCOME: "#4ade80", EXPENSE: "#f87171", TRANSFER: "#94a3b8" };
const ACCOUNT_ICONS = { CHECKING: "🏦", SAVINGS: "💰", CREDIT: "💳", CASH: "💵" };

function fmt(n) {
  return Number(n).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ═══════════════════════════════════════════════════════════
//  HABIT ANALYZER (logică pură JS, fără DB)
// ═══════════════════════════════════════════════════════════
function analyzeHabits(transactions) {
  const expenses = transactions.filter(t => t.type === "EXPENSE");
  const incomes  = transactions.filter(t => t.type === "INCOME");
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome  = incomes.reduce((s, t) => s + t.amount, 0);
  const net          = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? ((net / totalIncome) * 100).toFixed(1) : 0;

  const byCategory = {};
  expenses.forEach(t => {
    const cat = t.category || "Necategorizat";
    byCategory[cat] = (byCategory[cat] || 0) + t.amount;
  });
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1]);

  const alerts = [];
  if (totalExpense > totalIncome)
    alerts.push({ type: "danger", msg: `Cheltuielile (${fmt(totalExpense)} RON) depășesc veniturile!` });
  if (savingsRate < 10 && totalIncome > 0)
    alerts.push({ type: "warn", msg: `Rata de economisire e scăzută: ${savingsRate}%. Recomandare: minim 20%.` });
  topCategories.forEach(([cat, val]) => {
    if (totalExpense > 0 && (val / totalExpense) > 0.4)
      alerts.push({ type: "info", msg: `"${cat}" reprezintă ${((val/totalExpense)*100).toFixed(0)}% din cheltuieli.` });
  });
  if (alerts.length === 0)
    alerts.push({ type: "ok", msg: "Situație financiară echilibrată! Continuă tot așa." });

  return { totalIncome, totalExpense, net, savingsRate, byCategory, topCategories, alerts };
}

// ═══════════════════════════════════════════════════════════
//  COMPONENTE UI
// ═══════════════════════════════════════════════════════════

function Badge({ type }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
      background: TYPE_COLOR[type] + "22", color: TYPE_COLOR[type], letterSpacing: 1
    }}>
      {TYPE_ICON[type]} {type}
    </span>
  );
}

function Alert({ type, msg }) {
  const cfg = {
    danger: { bg: "#fee2e2", border: "#fca5a5", color: "#991b1b", icon: "⚠️" },
    warn:   { bg: "#fef9c3", border: "#fde047", color: "#854d0e", icon: "💡" },
    info:   { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af", icon: "📊" },
    ok:     { bg: "#f0fdf4", border: "#86efac", color: "#166534", icon: "✅" },
  }[type];
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10,
      padding: "10px 14px", marginBottom: 8, color: cfg.color, fontSize: 13 }}>
      {cfg.icon} {msg}
    </div>
  );
}

function MiniBar({ value, max, color }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, flex: 1, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%",
        background: color, borderRadius: 99, transition: "width .4s ease" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  VIEWS
// ═══════════════════════════════════════════════════════════

function DashboardView({ accounts, transactions }) {
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const { totalIncome, totalExpense, net, savingsRate, topCategories, alerts } = analyzeHabits(transactions);
  const maxCat = topCategories[0]?.[1] || 1;

  return (
    <div>
      {/* Hero balance */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: 18, padding: "28px 32px", marginBottom: 20, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140,
          borderRadius: "50%", background: "rgba(99,102,241,.15)" }} />
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
          Sold total
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>
          {fmt(totalBalance)} <span style={{ fontSize: 20, color: "#94a3b8" }}>RON</span>
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
          {[["Venituri", totalIncome, "#4ade80"], ["Cheltuieli", totalExpense, "#f87171"], ["Net", net, net >= 0 ? "#60a5fa" : "#f87171"]].map(([label, val, col]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: col }}>{fmt(val)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Conturi */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
            Conturi
          </div>
          {accounts.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{ACCOUNT_ICONS[a.type]}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.type}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{fmt(a.balance)} RON</div>
            </div>
          ))}
        </div>

        {/* Rata economisire */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
            Economisire
          </div>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 48, fontWeight: 800,
              color: savingsRate >= 20 ? "#4ade80" : savingsRate >= 10 ? "#fbbf24" : "#f87171" }}>
              {savingsRate}%
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>rată de economisire</div>
            <div style={{ background: "#f1f5f9", borderRadius: 99, height: 8, marginTop: 14, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, savingsRate)}%`, height: "100%", borderRadius: 99,
                background: savingsRate >= 20 ? "#4ade80" : savingsRate >= 10 ? "#fbbf24" : "#f87171",
                transition: "width .6s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Țintă recomandată: 20%</div>
          </div>
        </div>
      </div>

      {/* Top categorii */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
          Top Categorii Cheltuieli
        </div>
        {topCategories.slice(0, 5).map(([cat, val]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[cat] || "#94a3b8", flexShrink: 0 }} />
            <div style={{ minWidth: 110, fontSize: 13, color: "#334155", fontWeight: 500 }}>{cat}</div>
            <MiniBar value={val} max={maxCat} color={CATEGORY_COLORS[cat] || "#94a3b8"} />
            <div style={{ minWidth: 80, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{fmt(val)} RON</div>
          </div>
        ))}
      </div>

      {/* Alerte */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
          Analiză & Alerte
        </div>
        {alerts.map((a, i) => <Alert key={i} {...a} />)}
      </div>
    </div>
  );
}

function TransactionsView({ accounts, transactions, onAdd, onDelete }) {
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState({ accountId: accounts[0]?.id, type: "EXPENSE", amount: "", category: "", description: "", date: new Date().toISOString().slice(0,10) });
  const [showForm, setShowForm] = useState(false);

  const filtered = filter === "ALL" ? transactions : transactions.filter(t => t.type === filter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) return;
    onAdd({ ...form, amount: +form.amount });
    setShowForm(false);
    setForm(f => ({ ...f, amount: "", description: "", category: "" }));
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL","INCOME","EXPENSE","TRANSFER"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 99, border: "1px solid #e2e8f0", cursor: "pointer",
              background: filter === f ? "#1e293b" : "#fff",
              color: filter === f ? "#fff" : "#64748b", fontSize: 12, fontWeight: 600
            }}>{f === "ALL" ? "Toate" : f}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          padding: "8px 18px", borderRadius: 99, background: "#6366f1", color: "#fff",
          border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13
        }}>+ Adaugă</button>
      </div>

      {/* Form adaugare */}
      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14,
          padding: 20, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CONT</label>
              <select value={form.accountId} onChange={e => setForm(f => ({...f, accountId: +e.target.value}))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TIP</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}>
                <option>INCOME</option><option>EXPENSE</option><option>TRANSFER</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>SUMĂ (RON)</label>
              <input type="number" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({...f, amount: e.target.value}))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>CATEGORIE</label>
              <input placeholder="ex: Alimente" value={form.category}
                onChange={e => setForm(f => ({...f, category: e.target.value}))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>DESCRIERE</label>
              <input placeholder="ex: Cumpărături" value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>DATA</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({...f, date: e.target.value}))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 18px", borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
            <button onClick={handleAdd} style={{ padding: "8px 18px", borderRadius: 8,
              background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Salvează
            </button>
          </div>
        </div>
      )}

      {/* Lista tranzactii */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {sorted.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Nicio tranzacție</div>
        )}
        {sorted.map((t, i) => {
          const acc = accounts.find(a => a.id === t.accountId);
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px",
              borderBottom: i < sorted.length - 1 ? "1px solid #f1f5f9" : "none",
              transition: "background .15s" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: (CATEGORY_COLORS[t.category] || "#94a3b8") + "22",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginRight: 14 }}>
                {t.type === "INCOME" ? "💚" : t.type === "EXPENSE" ? "🔴" : "🔀"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                  {t.description || t.category}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {t.date} · {acc?.name} · <Badge type={t.type} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 16,
                  color: t.type === "INCOME" ? "#4ade80" : t.type === "EXPENSE" ? "#f87171" : "#94a3b8" }}>
                  {t.type === "EXPENSE" ? "-" : "+"}{fmt(t.amount)} RON
                </div>
                <button onClick={() => onDelete(t.id)} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#cbd5e1",
                  fontSize: 16, padding: 4, borderRadius: 6, lineHeight: 1
                }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccountsView({ accounts, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "CHECKING", currency: "RON" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    setShowForm(false);
    setForm({ name: "", type: "CHECKING", currency: "RON" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setShowForm(s => !s)} style={{
          padding: "8px 18px", borderRadius: 99, background: "#6366f1", color: "#fff",
          border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13
        }}>+ Cont nou</button>
      </div>

      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14,
          padding: 20, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[
              ["NUME", "text", "name", "ex: Cont Revolut"],
              ["MONEDĂ", "text", "currency", "RON / EUR"],
            ].map(([label, type, key, placeholder]) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>TIP</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}>
                <option>CHECKING</option><option>SAVINGS</option><option>CREDIT</option><option>CASH</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 18px", borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
            <button onClick={handleAdd} style={{ padding: "8px 18px", borderRadius: 8,
              background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Salvează
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {accounts.map(a => (
          <div key={a.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0",
            padding: 22, position: "relative" }}>
            <button onClick={() => onDelete(a.id)} style={{
              position: "absolute", top: 12, right: 12, background: "none", border: "none",
              cursor: "pointer", color: "#cbd5e1", fontSize: 14
            }}>✕</button>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{ACCOUNT_ICONS[a.type]}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{a.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>{a.type} · {a.currency}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: a.balance >= 0 ? "#1e293b" : "#f87171" }}>
              {fmt(a.balance)}
              <span style={{ fontSize: 14, color: "#94a3b8", marginLeft: 4 }}>{a.currency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyzerView({ transactions }) {
  const { totalIncome, totalExpense, net, savingsRate, topCategories, alerts, byCategory } = analyzeHabits(transactions);
  const maxCat = topCategories[0]?.[1] || 1;

  // Cheltuieli pe luni (simulate din datele existente)
  const byMonth = {};
  transactions.filter(t => t.type === "EXPENSE").forEach(t => {
    const m = t.date.slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + t.amount;
  });

  return (
    <div>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          ["Venituri", fmt(totalIncome) + " RON", "#4ade80", "💚"],
          ["Cheltuieli", fmt(totalExpense) + " RON", "#f87171", "🔴"],
          ["Net", fmt(net) + " RON", net >= 0 ? "#60a5fa" : "#f87171", "📊"],
          ["Economisire", savingsRate + "%", savingsRate >= 20 ? "#4ade80" : "#fbbf24", "🏦"],
        ].map(([label, val, color, icon]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Categorii detaliat */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
          Cheltuieli pe Categorii
        </div>
        {topCategories.map(([cat, val]) => (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[cat] || "#94a3b8" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{cat}</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  {totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0}%
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", minWidth: 90, textAlign: "right" }}>
                  {fmt(val)} RON
                </span>
              </div>
            </div>
            <MiniBar value={val} max={maxCat} color={CATEGORY_COLORS[cat] || "#94a3b8"} />
          </div>
        ))}
        {topCategories.length === 0 && (
          <div style={{ color: "#94a3b8", fontSize: 13 }}>Nicio cheltuială înregistrată.</div>
        )}
      </div>

      {/* Alerte */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
          Alerte & Recomandări
        </div>
        {alerts.map((a, i) => <Alert key={i} {...a} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("dashboard");
  const [users]        = useState(initialUsers);
  const [accounts, setAccounts]         = useState(initialAccounts);
  const [transactions, setTransactions] = useState(initialTransactions);
  const currentUser = users[0];

  // ── Handlers ─────────────────────────────────────────────
  const addTransaction = (form) => {
    const id = Date.now();
    const newTx = { id, ...form };
    setTransactions(prev => [...prev, newTx]);
    // Actualizeaza sold
    setAccounts(prev => prev.map(a => {
      if (a.id !== form.accountId) return a;
      const delta = form.type === "INCOME" ? form.amount : form.type === "EXPENSE" ? -form.amount : 0;
      return { ...a, balance: a.balance + delta };
    }));
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
    setAccounts(prev => prev.map(a => {
      if (a.id !== tx.accountId) return a;
      const reversal = tx.type === "INCOME" ? -tx.amount : tx.type === "EXPENSE" ? tx.amount : 0;
      return { ...a, balance: a.balance + reversal };
    }));
  };

  const addAccount = (form) => {
    const id = Date.now();
    setAccounts(prev => [...prev, { id, userId: currentUser.id, balance: 0, ...form }]);
  };

  const deleteAccount = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setTransactions(prev => prev.filter(t => t.accountId !== id));
  };

  const userTransactions = transactions.filter(t => accounts.some(a => a.id === t.accountId));

  // ── Nav ───────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard",    label: "Dashboard",    icon: "◉" },
    { id: "transactions", label: "Tranzacții",   icon: "⇅" },
    { id: "accounts",     label: "Conturi",      icon: "🏦" },
    { id: "analyzer",     label: "Analiză",      icon: "📊" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f8fafc",
      minHeight: "100vh", display: "flex" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#0f172a", display: "flex", flexDirection: "column",
        padding: "24px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>💸 FinancialMVP</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Prototip in-memory</div>
        </div>

        <div style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
              background: view === item.id ? "#6366f1" : "transparent",
              color: view === item.id ? "#fff" : "#64748b",
              fontSize: 14, fontWeight: view === item.id ? 700 : 500,
              marginBottom: 4, textAlign: "left", transition: "all .15s"
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#6366f1",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14 }}>
              {currentUser.fullName[0]}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{currentUser.fullName}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{currentUser.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>
              {navItems.find(n => n.id === view)?.label}
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
              Date stocate în memorie · nicio bază de date necesară
            </p>
          </div>

          {view === "dashboard"    && <DashboardView accounts={accounts} transactions={userTransactions} />}
          {view === "transactions" && <TransactionsView accounts={accounts} transactions={userTransactions}
              onAdd={addTransaction} onDelete={deleteTransaction} />}
          {view === "accounts"    && <AccountsView accounts={accounts} onAdd={addAccount} onDelete={deleteAccount} />}
          {view === "analyzer"    && <AnalyzerView transactions={userTransactions} />}
        </div>
      </div>
    </div>
  );
}