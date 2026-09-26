import { useMemo, useState } from "react";
import Logo from "./components/Logo";
import StatCard from "./components/StatCard";
import Modal from "./components/Modal";
import Receipt from "./receipt/Receipt";
import Login from "./pages/Login";
import { api } from "./services/api";

const today = new Date().toISOString().slice(0, 10);

const seedFarmers = [
  { id: "1", farmer_code: "67612", account_number: "26", name: "Laxman Baban Temkar", mobile: "9876543210", village: "Pune", milk_type: "COW", status: "ACTIVE" },
  { id: "2", farmer_code: "67613", account_number: "27", name: "Ganesh Pawar", mobile: "9876543211", village: "Pune", milk_type: "BUFFALO", status: "ACTIVE" },
  { id: "3", farmer_code: "67614", account_number: "28", name: "Rahul Shinde", mobile: "9876543212", village: "Pune", milk_type: "COW", status: "ACTIVE" }
];

const seedCollections = [
  { id: "1", receipt_number: "MC-20260924-001", farmer_id: "1", farmerName: "Laxman Baban Temkar", accountNumber: "26", collection_date: today, shift: "EVENING", milk_type: "COW", quantity_litre: 2.9, fat: 3.6, snf: 8.6, lacto: 26, rate: 36.5, amount: 105.85 },
  { id: "2", receipt_number: "MC-20260924-002", farmer_id: "2", farmerName: "Ganesh Pawar", accountNumber: "27", collection_date: today, shift: "EVENING", milk_type: "BUFFALO", quantity_litre: 4.2, fat: 6.0, snf: 9.0, lacto: 29, rate: 52.0, amount: 218.4 },
  { id: "3", receipt_number: "MC-20260924-003", farmer_id: "3", farmerName: "Rahul Shinde", accountNumber: "28", collection_date: today, shift: "MORNING", milk_type: "COW", quantity_litre: 3.5, fat: 3.8, snf: 8.7, lacto: 26, rate: 37.2, amount: 130.2 }
];

function useLocalData() {
  const [farmers, setFarmers] = useState(() => JSON.parse(localStorage.getItem("dmm_farmers") || "null") || seedFarmers);
  const [collections, setCollections] = useState(() => JSON.parse(localStorage.getItem("dmm_collections") || "null") || seedCollections);
  const saveFarmers = (x) => { setFarmers(x); localStorage.setItem("dmm_farmers", JSON.stringify(x)); };
  const saveCollections = (x) => { setCollections(x); localStorage.setItem("dmm_collections", JSON.stringify(x)); };
  return { farmers, saveFarmers, collections, saveCollections };
}

function formatMoney(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("dmm_auth") === "true");
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dmm_user") || "null"); } catch { return null; }
  });
  const [theme, setTheme] = useState(
  () => localStorage.getItem("dmm_theme") || "light"
  );

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("dmm_theme", nextTheme);
  }
  const { farmers, saveFarmers, collections, saveCollections } = useLocalData();
  function handleLogin(user) {
    localStorage.setItem("dmm_auth", "true");
    localStorage.setItem("dmm_user", JSON.stringify(user));
    setCurrentUser(user);
    setAuthenticated(true);
  }
  function handleLogout() {
    localStorage.removeItem("dmm_auth");
    localStorage.removeItem("dmm_user");
    setCurrentUser(null);
    setAuthenticated(false);
  }
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFarmer, setShowFarmer] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    farmerId: "", shift: "EVENING", milkType: "COW", quantity: "", fat: "", snf: "", lacto: "", rate: ""
  });

  const [farmerForm, setFarmerForm] = useState({
    farmer_code: "", account_number: "", name: "", mobile: "", village: "", milk_type: "COW"
  });

  const selectedFarmer = farmers.find((f) => f.id === form.farmerId);
  const calculatedAmount = useMemo(() => {
    const qty = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);
    return qty * rate;
  }, [form.quantity, form.rate]);

  const totalToday = collections.filter(c => c.collection_date === today).reduce((s, c) => s + Number(c.quantity_litre), 0);
  const amountToday = collections.filter(c => c.collection_date === today).reduce((s, c) => s + Number(c.amount), 0);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function selectFarmer(id) {
    const f = farmers.find(x => x.id === id);
    setForm(v => ({ ...v, farmerId: id, milkType: f?.milk_type === "BUFFALO" ? "BUFFALO" : "COW" }));
  }

  function saveCollection(e) {
    e.preventDefault();
    if (!selectedFarmer || !form.quantity || !form.fat || !form.rate) {
      notify("Please fill farmer, quantity, FAT and rate.");
      return;
    }
    const next = collections.length + 1;
    const receipt = {
      id: crypto.randomUUID(),
      receipt_number: `MC-${today.replaceAll("-", "")}-${String(next).padStart(3, "0")}`,
      farmer_id: selectedFarmer.id,
      farmerName: selectedFarmer.name,
      accountNumber: selectedFarmer.account_number,
      collection_date: today,
      shift: form.shift,
      milk_type: form.milkType,
      quantity_litre: Number(form.quantity),
      fat: Number(form.fat),
      snf: Number(form.snf || 0),
      lacto: Number(form.lacto || 0),
      rate: Number(form.rate),
      amount: Number(calculatedAmount.toFixed(2))
    };
    saveCollections([receipt, ...collections]);
    setSelectedReceipt(receipt);
    setForm({ farmerId: "", shift: "EVENING", milkType: "COW", quantity: "", fat: "", snf: "", lacto: "", rate: "" });
    notify("Collection saved successfully.");
  }

  function addFarmer(e) {
    e.preventDefault();
    if (!farmerForm.farmer_code || !farmerForm.name) {
      notify("Farmer code and name are required.");
      return;
    }
    const farmer = { ...farmerForm, id: crypto.randomUUID(), status: "ACTIVE" };
    saveFarmers([farmer, ...farmers]);
    setFarmerForm({ farmer_code: "", account_number: "", name: "", mobile: "", village: "", milk_type: "COW" });
    setShowFarmer(false);
    notify("Farmer added successfully.");
  }

  async function shareReceipt() {
    if (!selectedReceipt) return;
    const text = `दुध संकलन पावती ${selectedReceipt.receipt_number}\n${selectedReceipt.farmerName}\nलिटर: ${selectedReceipt.quantity_litre}\nफॅट: ${selectedReceipt.fat}\nरक्कम: ₹${selectedReceipt.amount.toFixed(2)}`;
    if (navigator.share) {
      await navigator.share({ title: "Milk Collection Receipt", text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  function printReceipt() {
    if (!selectedReceipt) return;
    const node = document.getElementById("receipt");
    const w = window.open("", "_blank", "width=520,height=760");
    w.document.write(`<html><head><title>Receipt</title><style>body{font-family:Arial,sans-serif;padding:24px} .receipt{max-width:390px;margin:auto;border:1px solid #ddd;padding:24px} .receipt-title{text-align:center;font-size:28px;font-weight:800}.receipt-date{text-align:center;margin:12px 0 20px}.receipt-line,.receipt-total-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px dashed #bbb}.receipt-farmer{text-align:center;font-size:19px;font-weight:800;margin:18px 0}.receipt-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;border-block:1px solid #ddd;padding:12px 0}.receipt-grid b{text-align:right}.grand{font-size:21px;border-top:2px solid #111;border-bottom:0;margin-top:8px}.receipt-footer{text-align:center;font-size:11px;margin-top:20px;color:#666}</style></head><body>${node.outerHTML}</body></html>`);
    w.document.close(); w.focus(); w.print();
  }

  if (!authenticated) return <Login onLogin={handleLogin} />;

  const filteredFarmers = farmers.filter(f => `${f.farmer_code} ${f.name} ${f.mobile}`.toLowerCase().includes(search.toLowerCase()));
  const nav = [
    ["dashboard", "▦", "Dashboard"],
    ["collection", "＋", "Milk Collection"],
    ["farmers", "♙", "Farmers"],
    ["history", "◷", "Collection History"],
    ["reports", "▤", "Reports"]
  ];

  return (
    <div className={`app-shell ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <Logo />
        <div className="sidebar-section">MAIN MENU</div>
        <nav>{nav.map(([key, icon, label]) => (
          <button key={key} className={page === key ? "active" : ""} onClick={() => { setPage(key); setMobileOpen(false); }}>
            <span>{icon}</span>{label}
          </button>
        ))}</nav>
        <div className="sidebar-bottom">
          <div className="operator"><div className="avatar">{currentUser?.name?.[0] || "A"}</div><div className="operator-info"><strong>{currentUser?.name || "Admin"}</strong><span>{currentUser?.role || "Administrator"}</span></div><button className="logout-btn" onClick={handleLogout} title="Logout">?</button></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          <div><h1>{nav.find(n => n[0] === page)?.[2] || "Dashboard"}</h1><p>{new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}</p></div>
          <div className="top-actions">
  <span className="live-dot">● Online</span>

  <button
    className="theme-toggle"
    onClick={toggleTheme}
    title={theme === "light" ? "Dark mode" : "Bright mode"}
    aria-label={theme === "light" ? "Dark mode" : "Bright mode"}
  >
    {theme === "light" ? "☾" : "☀"}
  </button>

  <div className="avatar">
    {(currentUser?.name || "A").charAt(0).toUpperCase()}
  </div>
</div>
        </header>

        {page === "dashboard" && (
          <section className="content">
            <div className="welcome"><div><span className="eyebrow">GOOD EVENING</span><h2>Welcome to your collection center</h2><p>Track today's milk collection and farmer payments from one place.</p></div><button className="primary" onClick={() => setPage("collection")}>＋ New Collection</button></div>
            <div className="stats">
              <StatCard icon="🥛" label="Today's Milk" value={`${totalToday.toFixed(2)} L`} hint="Across all shifts" tone="teal" />
              <StatCard icon="₹" label="Today's Amount" value={formatMoney(amountToday)} hint="Calculated collection value" tone="gold" />
              <StatCard icon="♙" label="Active Farmers" value={farmers.filter(f => f.status === "ACTIVE").length} hint="Registered farmers" />
              <StatCard icon="◷" label="Collections" value={collections.filter(c => c.collection_date === today).length} hint="Today's entries" />
            </div>
            <div className="panel">
              <div className="panel-head"><div><h3>Recent Collections</h3><p>Latest milk collection entries</p></div><button className="text-btn" onClick={() => setPage("history")}>View all →</button></div>
              <CollectionTable rows={collections.slice(0, 6)} onReceipt={setSelectedReceipt} />
            </div>
          </section>
        )}

        {page === "collection" && (
          <section className="content collection-layout">
            <form className="panel collection-form" onSubmit={saveCollection}>
              <div className="panel-head"><div><h3>New Milk Collection</h3><p>Enter today's milk test results</p></div><span className="shift-pill">{form.shift === "EVENING" ? "संध्या" : "सकाळ"}</span></div>
              <label>Farmer</label>
              <select value={form.farmerId} onChange={e => selectFarmer(e.target.value)}><option value="">Select farmer</option>{farmers.filter(f => f.status === "ACTIVE").map(f => <option key={f.id} value={f.id}>{f.farmer_code} — {f.name}</option>)}</select>
              {selectedFarmer && <div className="farmer-chip"><div className="avatar small">{selectedFarmer.name[0]}</div><div><strong>{selectedFarmer.name}</strong><span>Account {selectedFarmer.account_number || "—"} · {selectedFarmer.village || "—"}</span></div></div>}
              <div className="two-col"><div><label>Shift</label><div className="segmented"><button type="button" className={form.shift==="MORNING"?"selected":""} onClick={() => setForm({...form, shift:"MORNING"})}>सकाळ</button><button type="button" className={form.shift==="EVENING"?"selected":""} onClick={() => setForm({...form, shift:"EVENING"})}>संध्या</button></div></div><div><label>Milk Type</label><div className="segmented"><button type="button" className={form.milkType==="COW"?"selected":""} onClick={() => setForm({...form, milkType:"COW"})}>गाय</button><button type="button" className={form.milkType==="BUFFALO"?"selected":""} onClick={() => setForm({...form, milkType:"BUFFALO"})}>म्हैस</button></div></div></div>
              <div className="three-col"><Field label="Quantity (L)" type="number" step="0.01" value={form.quantity} onChange={v=>setForm({...form,quantity:v})} placeholder="2.90" /><Field label="FAT" type="number" step="0.1" value={form.fat} onChange={v=>setForm({...form,fat:v})} placeholder="3.6" /><Field label="SNF" type="number" step="0.1" value={form.snf} onChange={v=>setForm({...form,snf:v})} placeholder="8.6" /></div>
              <div className="two-col"><Field label="Lacto / CLR" type="number" step="0.1" value={form.lacto} onChange={v=>setForm({...form,lacto:v})} placeholder="26.0" /><Field label="Rate (₹ / L)" type="number" step="0.01" value={form.rate} onChange={v=>setForm({...form,rate:v})} placeholder="36.50" /></div>
              <div className="amount-box"><span>Calculated amount</span><strong>{formatMoney(calculatedAmount)}</strong></div>
              <button className="primary full" type="submit">Save Collection & Generate Receipt</button>
            </form>
            <div className="panel tips"><h3>Collection checklist</h3><div className="check">✓ Verify farmer account</div><div className="check">✓ Confirm milk type</div><div className="check">✓ Enter measured quantity</div><div className="check">✓ Enter FAT and SNF</div><div className="check">✓ Confirm applicable rate</div><div className="tip-note">The receipt is generated from the saved collection so the displayed values always match the database entry.</div></div>
          </section>
        )}

        {page === "farmers" && (
          <section className="content">
            <div className="page-actions"><div><h2>Farmers</h2><p>Manage registered milk producers.</p></div><button className="primary" onClick={() => setShowFarmer(true)}>＋ Add Farmer</button></div>
            <div className="toolbar"><input placeholder="Search farmer, code or mobile..." value={search} onChange={e=>setSearch(e.target.value)} /><span>{filteredFarmers.length} farmers</span></div>
            <div className="panel"><CollectionTable farmers rows={filteredFarmers} /></div>
          </section>
        )}

        {page === "history" && (
          <section className="content"><div className="page-actions"><div><h2>Collection History</h2><p>Review and re-share previous receipts.</p></div></div><div className="panel"><CollectionTable rows={collections} onReceipt={setSelectedReceipt} /></div></section>
        )}

        {page === "reports" && (
          <section className="content"><div className="page-actions"><div><h2>Reports</h2><p>Reporting foundation — detailed exports come in the next phase.</p></div></div><div className="report-grid"><StatCard icon="📅" label="Daily Collection" value={`${totalToday.toFixed(2)} L`} hint={formatMoney(amountToday)} /><StatCard icon="♙" label="Farmer Count" value={farmers.length} hint="Registered" /><StatCard icon="🥛" label="Average Quantity" value={`${(totalToday / Math.max(collections.filter(c=>c.collection_date===today).length,1)).toFixed(2)} L`} hint="Per collection" /></div><div className="panel empty-report"><div className="empty-icon">▤</div><h3>Detailed reports are next</h3><p>Daily, monthly, farmer statements, PDF and Excel exports will be connected after the core collection workflow.</p></div></section>
        )}
      </main>

      {toast && <div className="toast">✓ {toast}</div>}

      {selectedReceipt && <Modal title="Collection Receipt" wide onClose={() => setSelectedReceipt(null)}>
        <div className="receipt-modal">
          <Receipt data={{ ...selectedReceipt, date: selectedReceipt.collection_date }} />
          <div className="receipt-actions"><button className="secondary" onClick={printReceipt}>Print</button><button className="whatsapp" onClick={shareReceipt}>Share on WhatsApp</button></div>
        </div>
      </Modal>}

      {showFarmer && <Modal title="Add Farmer" onClose={() => setShowFarmer(false)}>
        <form className="modal-form" onSubmit={addFarmer}>
          <Field label="Farmer Code" value={farmerForm.farmer_code} onChange={v=>setFarmerForm({...farmerForm,farmer_code:v})} placeholder="67615" />
          <Field label="Account Number" value={farmerForm.account_number} onChange={v=>setFarmerForm({...farmerForm,account_number:v})} placeholder="29" />
          <Field label="Farmer Name" value={farmerForm.name} onChange={v=>setFarmerForm({...farmerForm,name:v})} placeholder="Full name" />
          <Field label="Mobile" value={farmerForm.mobile} onChange={v=>setFarmerForm({...farmerForm,mobile:v})} placeholder="10 digit mobile" />
          <Field label="Village" value={farmerForm.village} onChange={v=>setFarmerForm({...farmerForm,village:v})} placeholder="Village" />
          <label>Milk Type</label><select value={farmerForm.milk_type} onChange={e=>setFarmerForm({...farmerForm,milk_type:e.target.value})}><option value="COW">Cow</option><option value="BUFFALO">Buffalo</option></select>
          <button className="primary full" type="submit">Save Farmer</button>
        </form>
      </Modal>}
    </div>
  );
}

function Field({ label, value, onChange, type="text", step, placeholder }) {
  return <div className="field"><label>{label}</label><input type={type} step={step} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} /></div>;
}

function CollectionTable({ rows, onReceipt, farmers = false }) {
  if (!rows.length) return <div className="empty">No records found.</div>;
  if (farmers) return <div className="table-wrap"><table><thead><tr><th>Farmer</th><th>Code</th><th>Mobile</th><th>Village</th><th>Milk</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.name}</strong></td><td>{r.farmer_code}</td><td>{r.mobile || "—"}</td><td>{r.village || "—"}</td><td>{r.milk_type === "BUFFALO" ? "Buffalo" : "Cow"}</td><td><span className="status">{r.status}</span></td></tr>)}</tbody></table></div>;
  return <div className="table-wrap"><table><thead><tr><th>Receipt</th><th>Farmer</th><th>Shift</th><th>Qty</th><th>FAT</th><th>Rate</th><th>Amount</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><span className="receipt-no">{r.receipt_number}</span></td><td><strong>{r.farmerName}</strong><small>#{r.accountNumber || "—"}</small></td><td>{r.shift === "EVENING" ? "Evening" : "Morning"}</td><td>{Number(r.quantity_litre).toFixed(2)} L</td><td>{Number(r.fat).toFixed(1)}</td><td>₹{Number(r.rate).toFixed(2)}</td><td><strong>₹{Number(r.amount).toFixed(2)}</strong></td><td><button className="small-btn" onClick={()=>onReceipt?.(r)}>Receipt</button></td></tr>)}</tbody></table></div>;
}
