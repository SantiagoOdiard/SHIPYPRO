import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Box,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CheckCircle,
  FileSpreadsheet,
  FileText,
  Home,
  PackageCheck,
  Plane,
  Plus,
  RotateCcw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { demoData } from "./demoData";

const API_URL = "http://127.0.0.1:8000/api/overview";

const nav = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Shipments", path: "/shipments", icon: Box },
  { label: "Carrier Intelligence", path: "/carriers", icon: ShieldCheck },
  { label: "Predictive Alerts", path: "/alerts", icon: AlertTriangle, badge: 3 },
  { label: "Cost Optimizer", path: "/costs", icon: CircleDollarSign },
  { label: "Returns Intelligence", path: "/returns", icon: RotateCcw },
  { label: "AI Assistant", path: "/assistant", icon: Bot },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Settings", path: "/settings", icon: Settings },
];

function App() {
  const [data, setData] = useState(demoData);
  const [ready, setReady] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((payload) => setData(normalizeCurrency(payload)))
      .catch(() => setData(demoData))
      .finally(() => setReady(true));
  }, []);

  return (
    <div className="min-h-screen bg-[#071018] text-slate-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.12),transparent_26%)]" />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <main className="main-shell">
          <Topbar onOpenImport={() => setImportOpen(true)} />
          <Routes>
            <Route path="/" element={<Dashboard data={data} ready={ready} />} />
            <Route path="/shipments" element={<Shipments data={data} />} />
            <Route path="/carriers" element={<Carriers data={data} />} />
            <Route path="/alerts" element={<Alerts data={data} />} />
            <Route path="/costs" element={<CostOptimizer data={data} />} />
            <Route path="/returns" element={<Returns data={data} />} />
            <Route path="/assistant" element={<Assistant data={data} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImport={(rows) => {
            setData((current) => mergeImportedShipments(current, rows));
            setImportResult(`${rows.length} spedizioni importate correttamente`);
            setImportOpen(false);
          }}
        />
      )}
      {importResult && (
        <button className="toast" onClick={() => setImportResult(null)}>
          <CheckCircle size={18} />
          {importResult}
        </button>
      )}
    </div>
  );
}

function normalizeCurrency(payload) {
  return {
    ...payload,
    kpis: payload.kpis.map((kpi) => ({ ...kpi, value: kpi.value.replace("EUR", "€") })),
  };
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Plane size={22} /></div>
        <div>
          <p className="brand-title">ShippyPro</p>
          <p className="brand-subtitle">AI Logistics Copilot</p>
        </div>
      </div>
      <nav className="nav-list">
        {nav.map((item) => (
          <NavLink key={item.label} to={item.path} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <item.icon size={18} />
            <span>{item.label}</span>
            {item.badge && <b>{item.badge}</b>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="upgrade"><Sparkles size={16} /> Upgrade Plan</button>
        <div className="profile">
          <div className="avatar">AB</div>
          <div>
            <p>Andrea B.</p>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onOpenImport }) {
  return (
    <header className="topbar">
      <div>
        <h1>Benvenuto, Andrea</h1>
        <p>Ecco cosa sta succedendo oggi con le tue spedizioni.</p>
      </div>
      <div className="top-actions">
        <button className="date-btn">01 Maggio - 31 Maggio 2025 <Calendar size={17} /></button>
        <button className="primary-btn" onClick={onOpenImport}><Plus size={18} /> Importa Spedizioni</button>
        <button className="icon-btn"><Bell size={18} /><span /></button>
      </div>
    </header>
  );
}

function ImportModal({ onClose, onImport }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState(sampleImportRows);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseShipmentCsv(String(reader.result || ""));
        if (!parsed.length) {
          setError("Il CSV non contiene spedizioni valide.");
          return;
        }
        setRows(parsed);
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <section className="import-modal">
        <div className="modal-head">
          <div>
            <h2 id="import-title">Importa spedizioni</h2>
            <p>Carica un CSV oppure usa dati demo per alimentare dashboard, costi e registro operativo.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Chiudi importazione"><X size={18} /></button>
        </div>

        <label className="upload-box">
          <Upload size={24} />
          <strong>{fileName || "Seleziona file CSV"}</strong>
          <span>Campi supportati: id, carrier, destination, status, date, cost</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        </label>

        {error && <p className="import-error">{error}</p>}

        <div className="import-preview">
          <div>
            <FileSpreadsheet size={18} />
            <span>{rows.length} righe pronte</span>
          </div>
          <table>
            <thead><tr><th>ID</th><th>Corriere</th><th>Destinazione</th><th>Stato</th><th>Costo</th></tr></thead>
            <tbody>
              {rows.slice(0, 4).map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.carrier}</td>
                  <td>{row.destination}</td>
                  <td>{row.status}</td>
                  <td>{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Annulla</button>
          <button className="primary-btn" onClick={() => onImport(rows)} disabled={!rows.length}>
            <Upload size={18} /> Importa {rows.length} spedizioni
          </button>
        </div>
      </section>
    </div>
  );
}

const sampleImportRows = [
  { id: "SP-735701", carrier: "DHL", destination: "Francia", status: "In transito", date: "01 Giu 2025", cost: "EUR17.90" },
  { id: "SP-735702", carrier: "UPS", destination: "Germania", status: "Consegnata", date: "01 Giu 2025", cost: "EUR22.40" },
  { id: "SP-735703", carrier: "GLS", destination: "Italia", status: "A rischio", date: "01 Giu 2025", cost: "EUR8.70" },
  { id: "SP-735704", carrier: "DPD", destination: "Spagna", status: "In ritardo", date: "01 Giu 2025", cost: "EUR14.20" },
];

function parseShipmentCsv(csv) {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  const required = ["id", "carrier", "destination", "status", "date", "cost"];
  const missing = required.filter((field) => !headers.includes(field));
  if (missing.length) {
    throw new Error(`Campi mancanti nel CSV: ${missing.join(", ")}`);
  }

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ""]));
    return {
      id: record.id,
      carrier: record.carrier,
      destination: record.destination,
      status: record.status,
      date: record.date,
      cost: formatCost(record.cost),
    };
  }).filter((row) => row.id && row.carrier && row.destination);
}

function splitCsvLine(line) {
  return line.split(",").map((value) => value.replace(/^"|"$/g, ""));
}

function formatCost(value) {
  const numeric = Number(String(value).replace(/[^\d.,-]/g, "").replace(",", "."));
  if (Number.isNaN(numeric)) return value || "EUR0.00";
  return `EUR${numeric.toFixed(2)}`;
}

function mergeImportedShipments(current, rows) {
  const importedTotal = rows.length;
  const nextKpis = current.kpis.map((kpi) => {
    if (kpi.label !== "Spedizioni Totali") return kpi;
    return {
      ...kpi,
      value: formatInteger(parseInteger(kpi.value) + importedTotal),
      change: `+${importedTotal} importate`,
    };
  });

  return {
    ...current,
    kpis: nextKpis,
    shipments: [...rows, ...current.shipments],
  };
}

function parseInteger(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function formatInteger(value) {
  return value.toLocaleString("it-IT");
}

function Dashboard({ data, ready }) {
  return (
    <div className="space-y-4">
      <section className="kpi-grid">
        {data.kpis.map((kpi, index) => <KpiCard key={kpi.label} kpi={kpi} index={index} ready={ready} />)}
      </section>
      <section className="dashboard-grid">
        <Panel title="Performance Corrieri" action="On Time %">
          <CarrierBar data={data.carriers} />
        </Panel>
        <Panel title="Ritardi per Paese">
          <DelayMap countries={data.countryDelays} />
        </Panel>
        <Panel title="Predictive Alerts" action="Vedi tutti">
          <AlertList alerts={data.alerts} compact />
        </Panel>
      </section>
      <section className="analytics-grid">
        <Panel title="Costo Spedizioni" subtitle="€128.430" detail="+8.2% vs mese scorso" action="Giornaliero">
          <CostArea data={data.trend} />
        </Panel>
        <Panel title="Trend Ultimi 30 Giorni" action="Giornaliero">
          <TrendLines data={data.trend} />
        </Panel>
        <Panel title="AI Assistant" action="Vedi tutti">
          <AssistantPreview data={data} />
        </Panel>
      </section>
      <section className="bottom-grid">
        <Panel title="Ultime Spedizioni" action="Vedi tutte">
          <ShipmentTable shipments={data.shipments} />
        </Panel>
        <Panel title="Cost Optimizer" action="Vedi dettagli">
          <CostSummary data={data.costOptimizer} />
        </Panel>
        <Panel title="Returns Intelligence" action="Vedi dettagli">
          <ReturnsBars returnsData={data.returns} />
        </Panel>
      </section>
    </div>
  );
}

function KpiCard({ kpi, index, ready }) {
  const icons = [ArrowUpRight, PackageCheck, AlertTriangle, RotateCcw, ClipboardList, CircleDollarSign];
  const Icon = icons[index] || BarChart3;
  return (
    <article className={`kpi-card ${ready ? "loaded" : ""}`}>
      <div className="kpi-head">
        <span className={`kpi-icon ${kpi.tone}`}><Icon size={18} /></span>
        <p>{kpi.label}</p>
      </div>
      <strong>{kpi.value}</strong>
      <div className="kpi-foot">
        <span className={kpi.tone}>{kpi.change}</span>
        <MiniSpark tone={kpi.tone} />
      </div>
    </article>
  );
}

function Panel({ title, subtitle, detail, action, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <strong>{subtitle}</strong>}
          {detail && <p>{detail}</p>}
        </div>
        {action && <button>{action} {action.includes("%") || action.includes("Giornaliero") ? <ChevronDown size={14} /> : null}</button>}
      </div>
      {children}
    </section>
  );
}

function CarrierBar({ data }) {
  return (
    <div className="chart-h">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,.13)" />
          <XAxis dataKey="name" stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<ChartTip />} />
          <Bar dataKey="onTime" radius={[7, 7, 0, 0]} fill="#2DD4BF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DelayMap({ countries }) {
  return (
    <div className="map-wrap">
      <div className="map-visual">
        {countries.map((country, i) => (
          <span key={country.country} className={`map-bubble b${i}`} style={{ "--size": `${country.growth * 2.2}px` }} />
        ))}
        <div className="map-lines" />
      </div>
      <div className="country-list">
        {countries.map((item) => (
          <div key={item.country}>
            <span>{item.country}</span>
            <b>+{item.growth}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostArea({ data }) {
  return (
    <div className="chart-h">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,.12)" />
          <XAxis dataKey="date" stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} interval={6} />
          <YAxis stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `€${Math.round(v / 1000)}K`} />
          <Tooltip content={<ChartTip />} />
          <Area dataKey="cost" stroke="#2DD4BF" fill="url(#costGradient)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendLines({ data }) {
  return (
    <div className="chart-h">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,.12)" />
          <XAxis dataKey="date" stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} interval={6} />
          <YAxis stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTip />} />
          <Line dataKey="shipments" stroke="#2DD4BF" strokeWidth={2.5} dot={false} />
          <Line dataKey="delays" stroke="#FF5252" strokeWidth={2} dot={false} />
          <Line dataKey="returns" stroke="#FACC15" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AlertList({ alerts, compact = false }) {
  return (
    <div className={compact ? "alert-list compact" : "alert-list"}>
      {alerts.map((alert) => (
        <article key={alert.title} className="alert-row">
          <span className={alert.priority === "Alta" ? "danger" : "warning"}><AlertTriangle size={22} /></span>
          <div>
            <h3>{alert.title}</h3>
            <p>{alert.impact}</p>
          </div>
          <b className={alert.priority === "Alta" ? "high" : "medium"}>{alert.priority}</b>
        </article>
      ))}
    </div>
  );
}

function AssistantPreview({ data }) {
  return (
    <div className="assistant-card">
      <p className="question">Perche sono aumentati i ritardi in Germania?</p>
      <div className="answer">
        <p>Ho analizzato i dati degli ultimi 30 giorni. Ecco cosa emerge:</p>
        <ul>
          {data.assistantAnswer.data.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <strong>Azione consigliata:</strong>
        <p>{data.assistantAnswer.action}</p>
      </div>
      <div className="ask-row"><span>Fai una domanda...</span><button><Send size={16} /></button></div>
    </div>
  );
}

function ShipmentTable({ shipments }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>ID Spedizione</th><th>Corriere</th><th>Destinazione</th><th>Stato</th><th>Data</th><th>Costo</th></tr></thead>
        <tbody>
          {shipments.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td><td>{row.carrier}</td><td>{row.destination}</td>
              <td><span className={`status ${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></td>
              <td>{row.date}</td><td>{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CostSummary({ data }) {
  return (
    <div className="cost-summary">
      <p>Risparmio potenziale identificato</p>
      <strong>€{data.identifiedSaving.toLocaleString("it-IT")}</strong>
      <span>+14.3% vs mese scorso</span>
      <p>Raccomandazione principale</p>
      <em>{data.recommendation}</em>
      <button>Vedi tutte le raccomandazioni</button>
    </div>
  );
}

function ReturnsBars({ returnsData }) {
  return (
    <div className="returns-list">
      <p>Motivi principali di reso</p>
      {returnsData.map((item) => (
        <div className="return-row" key={item.reason}>
          <span>{item.reason}</span>
          <div><i style={{ width: `${item.value * 3}%` }} /></div>
          <b>{item.value}%</b>
        </div>
      ))}
      <strong>Costo resi questo mese<br />€14.230 <span>+11.2%</span></strong>
    </div>
  );
}

function Carriers({ data }) {
  return (
    <Page title="Carrier Intelligence" subtitle="Benchmark operativo su SLA, costo medio, problemi e volume per corriere.">
      <div className="carrier-cards">
        {data.carriers.map((carrier) => (
          <article className="carrier-card" key={carrier.name}>
            <div><Truck /><h3>{carrier.name}</h3><b>{carrier.rating.toFixed(1)}</b></div>
            <Metric label="On Time" value={`${carrier.onTime}%`} />
            <Metric label="Costo medio" value={`€${carrier.avgCost.toFixed(2)}`} />
            <Metric label="Problemi" value={carrier.issues} />
            <Metric label="Volume" value={carrier.volume.toLocaleString("it-IT")} />
          </article>
        ))}
      </div>
      <Insight text="GLS mostra un incremento del 18% nei ritardi in Germania. UPS mantiene il miglior rapporto costo/prestazioni sulle tratte premium." />
    </Page>
  );
}

function Shipments({ data }) {
  return <Page title="Shipments" subtitle="Vista operativa delle spedizioni recenti con stato, costo e destinazione."><Panel title="Registro Spedizioni"><ShipmentTable shipments={data.shipments} /></Panel></Page>;
}

function Alerts({ data }) {
  return <Page title="Predictive Alerts" subtitle="Avvisi generati dal modello predittivo per ritardi, anomalie e resi."><AlertList alerts={data.alerts} /><Insight text="Priorita calcolata combinando probabilita, impatto economico e SLA cliente." /></Page>;
}

function CostOptimizer({ data }) {
  return <Page title="Cost Optimizer" subtitle="Raccomandazioni automatiche su carrier, peso, dimensioni, rotta e costo."><div className="split"><Panel title="Opportunita principali"><CostSummary data={data.costOptimizer} /></Panel><Panel title="Costo ultimi 30 giorni"><CostArea data={data.trend} /></Panel></div></Page>;
}

function Returns({ data }) {
  return <Page title="Returns Intelligence" subtitle="Analisi dei motivi di reso, paesi critici, prodotti e costo stimato."><div className="split"><Panel title="Motivi principali"><ReturnsBars returnsData={data.returns} /></Panel><Panel title="Trend Resi"><TrendLines data={data.trend} /></Panel></div></Page>;
}

function Assistant({ data }) {
  const [question, setQuestion] = useState("Dove stiamo perdendo soldi?");
  const [answer, setAnswer] = useState(data.assistantAnswer);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAnswer(data.assistantAnswer);
  }, [data.assistantAnswer]);

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isThinking) return;

    const localAnswer = buildLocalAssistantAnswer(cleanQuestion, data);
    setAnswer(localAnswer);
    setIsThinking(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion }),
      });
      if (!response.ok) throw new Error("API non disponibile");
      const payload = await response.json();
      if (isStaleAssistantResponse(payload, cleanQuestion)) {
        setError("Risposta aggiornata usando l'analisi locale del copilot.");
      } else {
        setAnswer({
          analysis: payload.analysis,
          data: payload.data,
          action: payload.action,
        });
      }
    } catch {
      setError("Risposta generata in modalita demo locale.");
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <Page title="AI Assistant" subtitle="Copilot professionale per domande operative su performance, rischio e costo.">
      <section className="assistant-page">
        <form className="prompt-row" onSubmit={handleSubmit}>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Chiedi qualcosa sui tuoi dati logistici..." />
          <button disabled={isThinking || !question.trim()}><Send size={17} /> {isThinking ? "Analizzo..." : "Analizza"}</button>
        </form>
        <div className="quick-prompts">
          {["Dove stiamo guadagnando soldi?", "Perche aumentano i ritardi?", "Quale corriere e piu efficiente?", "Dove stiamo perdendo soldi?", "Quali spedizioni sono a rischio?"].map((prompt) => (
            <button key={prompt} onClick={() => setQuestion(prompt)}>{prompt}</button>
          ))}
        </div>
        {error && <p className="assistant-note">{error}</p>}
        <div className="answer large">
          <h3>Analisi</h3><p>{answer.analysis}</p>
          <h3>Dati</h3><ul>{answer.data.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Azione consigliata</h3><p>{answer.action}</p>
        </div>
      </section>
    </Page>
  );
}

function buildLocalAssistantAnswer(question, data) {
  const lowerQuestion = question.toLowerCase();
  const worstCarrier = [...data.carriers].sort((a, b) => a.onTime - b.onTime)[0];
  const bestCarrier = [...data.carriers].sort((a, b) => b.onTime - a.onTime)[0];
  const cheapestReliableCarrier = [...data.carriers]
    .filter((carrier) => carrier.onTime >= 85)
    .sort((a, b) => a.avgCost - b.avgCost)[0] || bestCarrier;
  const riskiestCountry = [...data.countryDelays].sort((a, b) => b.growth - a.growth)[0];
  const delayedShipments = data.shipments.filter((shipment) => shipment.status.toLowerCase().includes("ritardo") || shipment.status.toLowerCase().includes("rischio"));

  if (includesAny(lowerQuestion, ["guadagn", "profit", "margine", "rendendo", "migliori rotte", "miglior rotta"])) {
    return {
      analysis: `Stai guadagnando meglio dove il costo medio resta basso e la puntualita rimane alta. La combinazione piu forte e ${cheapestReliableCarrier.name}: costo medio EUR${cheapestReliableCarrier.avgCost.toFixed(2)} e ${cheapestReliableCarrier.onTime}% on time.`,
      data: [
        `${cheapestReliableCarrier.name}: miglior equilibrio margine/SLA`,
        `Risparmio stimato mensile: EUR${data.costOptimizer.identifiedSaving.toLocaleString("it-IT")}`,
        `${bestCarrier.name}: performance piu alta con ${bestCarrier.onTime}% on time`,
      ],
      action: `Aumenta il volume sulle tratte dove ${cheapestReliableCarrier.name} mantiene SLA alto e usa ${bestCarrier.name} per clienti premium o ordini ad alto valore.`,
    };
  }

  if (lowerQuestion.includes("corriere") || lowerQuestion.includes("efficiente")) {
    return {
      analysis: `${bestCarrier.name} e il corriere piu efficiente nel periodo analizzato, con ${bestCarrier.onTime}% di consegne puntuali e rating ${bestCarrier.rating.toFixed(1)}.`,
      data: [
        `${bestCarrier.name}: ${bestCarrier.onTime}% on time`,
        `${worstCarrier.name}: ${worstCarrier.onTime}% on time`,
        `Differenza operativa: ${bestCarrier.onTime - worstCarrier.onTime} punti percentuali`,
      ],
      action: `Mantieni ${bestCarrier.name} sulle spedizioni premium e limita ${worstCarrier.name} alle rotte dove il costo e prioritario rispetto allo SLA.`,
    };
  }

  if (includesAny(lowerQuestion, ["perd", "soldi", "costo", "costi", "risparm", "spreco", "pagando troppo"])) {
    return {
      analysis: "La perdita principale nasce da tratte economiche con bassa puntualita, che generano rimborsi, ticket customer care e seconde consegne.",
      data: [
        `Risparmio potenziale identificato: EUR${data.costOptimizer.identifiedSaving.toLocaleString("it-IT")}`,
        `Costo totale monitorato: ${data.kpis.find((kpi) => kpi.label === "Costo Totale")?.value || "EUR128.430"}`,
        `${worstCarrier.name} ha solo ${worstCarrier.onTime}% on time`,
      ],
      action: data.costOptimizer.recommendation,
    };
  }

  if (lowerQuestion.includes("rischio")) {
    return {
      analysis: `Ci sono ${delayedShipments.length} spedizioni recenti con segnali di rischio o ritardo, concentrate soprattutto su ${riskiestCountry.country}.`,
      data: [
        `${riskiestCountry.country}: +${riskiestCountry.growth}% crescita ritardi`,
        `${delayedShipments.length} spedizioni nel registro con stato critico`,
        `${worstCarrier.name} e il carrier con performance piu debole`,
      ],
      action: "Apri escalation preventiva sui clienti premium e rialloca le prossime spedizioni verso carrier con SLA piu stabile.",
    };
  }

  return {
    analysis: `L'aumento dei ritardi e guidato da ${riskiestCountry.country} e dal calo performance di ${worstCarrier.name}.`,
    data: [
      `${riskiestCountry.country}: +${riskiestCountry.growth}% ritardi`,
      `${worstCarrier.name}: ${worstCarrier.onTime}% consegne puntuali`,
      `Alert predittivi attivi: ${data.alerts.length}`,
    ],
    action: `Riduci temporaneamente il volume su ${worstCarrier.name}, monitora ${riskiestCountry.country} ogni giorno e aggiorna le promesse di consegna sui checkout ad alto rischio.`,
  };
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function isStaleAssistantResponse(payload, question) {
  const lowerQuestion = question.toLowerCase();
  const analysis = String(payload?.analysis || "").toLowerCase();
  const asksMoneyUpside = includesAny(lowerQuestion, ["guadagn", "profit", "margine"]);
  const asksCarrier = includesAny(lowerQuestion, ["corriere", "efficiente"]);
  const looksLikeOldDelayAnswer = analysis.includes("73% dei ritardi") || analysis.includes("carrier gls");

  return (
    looksLikeOldDelayAnswer &&
    (asksMoneyUpside || asksCarrier || includesAny(lowerQuestion, ["soldi", "costo", "risparm", "rischio"]))
  );
}

function Reports() {
  const reports = ["Executive Logistics Review", "Carrier SLA Benchmark", "Returns Intelligence Export"];
  return <Page title="Reports" subtitle="Generazione e esportazione PDF, CSV ed Excel per review settimanali, mensili e trimestrali."><div className="report-grid">{reports.map((report) => <article className="report-card" key={report}><FileText /><h3>{report}</h3><p>Maggio 2025</p><button>Genera report</button></article>)}</div></Page>;
}

function SettingsPage() {
  return <Page title="Settings" subtitle="Connessioni carrier, preferenze SLA, soglie predittive e profilo workspace."><Insight text="Workspace connesso a 6 carrier, soglia alert alta impostata a impatto superiore a €5.000 e SLA premium a 48 ore." /></Page>;
}

function Page({ title, subtitle, children }) {
  return <div className="page"><div className="page-head"><h2>{title}</h2><p>{subtitle}</p></div>{children}</div>;
}

function Metric({ label, value }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function Insight({ text }) {
  return <div className="insight"><Sparkles size={18} /><p>{text}</p></div>;
}

function MiniSpark({ tone }) {
  return <svg viewBox="0 0 80 24" aria-hidden="true"><path d="M2 18 C12 12 20 18 28 14 S42 10 50 14 62 8 78 5" fill="none" stroke={tone === "bad" ? "#FF5252" : "#2DD4BF"} strokeWidth="3" strokeLinecap="round" /></svg>;
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tip"><b>{label}</b>{payload.map((item) => <span key={item.dataKey}>{item.name}: {item.value}</span>)}</div>;
}

export default App;
