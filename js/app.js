/* ============================================
   Romantic Points 💖
   Fonctionne avec Firebase (Firestore) si la config
   est remplie, sinon en mode local (localStorage).
   ============================================ */

import { firebaseConfig, customIcons, allowedEmails } from "./firebase-config.js";

/* ---------- État global ---------- */
let transactions = []; // {id, amount, reason, ts}
let shopItems = []; // {id, name, cost, icon}
let pending = 0;
let currentRange = "day";
let chart = null;
let db = null;

const useFirebase = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("COLLE");

/* ---------- Icônes personnalisées ---------- */
function applyCustomIcon(imgId, emojiId, path) {
  if (!path) return;
  const img = document.getElementById(imgId);
  const emoji = document.getElementById(emojiId);
  img.src = path;
  img.classList.remove("hidden");
  emoji.classList.add("hidden");
}

function applyNavIcon(key, path) {
  if (!path) return;
  const span = document.querySelector(`.nav-icon[data-icon="${key}"]`);
  if (span) span.innerHTML = `<img src="${path}" alt="">`;
}

function setupCustomIcons() {
  applyCustomIcon("logo-img", "logo-emoji", customIcons.logo);
  applyCustomIcon("wallet-img", "wallet-emoji", customIcons.wallet);
  applyNavIcon("home", customIcons.navHome);
  applyNavIcon("stats", customIcons.navStats);
  applyNavIcon("history", customIcons.navHistory);
  applyNavIcon("shop", customIcons.navShop);
}

/* ---------- Couche de données ---------- */
let fs = null; // fonctions Firestore chargées dynamiquement
let authMod = null;
let auth = null;
let listenersStarted = false;

async function initData() {
  if (useFirebase) {
    const appMod = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js");
    fs = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js");
    authMod = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js");
    const app = appMod.initializeApp(firebaseConfig);
    db = fs.getFirestore(app);
    auth = authMod.getAuth(app);
    initAuth();
  } else {
    transactions = JSON.parse(localStorage.getItem("rp_transactions") || "[]");
    shopItems = JSON.parse(localStorage.getItem("rp_shop") || "[]");
    renderAll();
    renderShop();
  }
}

/* ---------- Authentification ---------- */
function emailAllowed(email) {
  // Si la liste n'est pas remplie, on laisse les règles Firestore décider
  const filled = allowedEmails.filter(e => e && !e.startsWith("COURRIEL"));
  return filled.length === 0 || filled.includes((email || "").toLowerCase());
}

function initAuth() {
  const overlay = $("login-overlay");
  const googleBtn = $("google-btn");
  const overlaySignout = $("overlay-signout-btn");
  const signoutBtn = $("signout-btn");
  const msg = $("login-msg");

  googleBtn.addEventListener("click", async () => {
    if (location.protocol === "file:") {
      msg.textContent = "⚠️ La connexion Google ne marche pas en ouvrant le fichier directement. Utilise l'URL GitHub Pages (ou un serveur local).";
      return;
    }
    try {
      await authMod.signInWithPopup(auth, new authMod.GoogleAuthProvider());
    } catch (err) {
      // Sur iPhone en mode plein écran, le popup peut être bloqué:
      // on bascule sur la redirection
      if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment") {
        try {
          await authMod.signInWithRedirect(auth, new authMod.GoogleAuthProvider());
        } catch (err2) {
          msg.textContent = "Erreur de connexion: " + (err2.code || err2.message);
        }
      } else if (err.code === "auth/unauthorized-domain") {
        msg.textContent = "⚠️ Domaine non autorisé: ajoute " + location.hostname + " dans Firebase → Authentication → Settings → Authorized domains.";
      } else if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        msg.textContent = "Erreur de connexion: " + (err.code || err.message);
      }
    }
  });

  const doSignOut = () => authMod.signOut(auth);
  overlaySignout.addEventListener("click", doSignOut);
  signoutBtn.addEventListener("click", () => {
    if (confirm("Se déconnecter?")) doSignOut();
  });

  authMod.onAuthStateChanged(auth, (user) => {
    if (user && emailAllowed(user.email)) {
      // Connecté et autorisé: on cache l'écran et on charge les données
      overlay.classList.add("hidden");
      signoutBtn.classList.remove("hidden");
      startListeners();
    } else {
      overlay.classList.remove("hidden");
      signoutBtn.classList.add("hidden");
      if (user) {
        // Connecté mais pas dans la liste des courriels autorisés
        msg.textContent = `Désolé, ${user.email} n'est pas autorisé 💔`;
        googleBtn.classList.add("hidden");
        overlaySignout.classList.remove("hidden");
      } else {
        msg.textContent = "Connecte-toi pour voir vos points 💖";
        googleBtn.classList.remove("hidden");
        overlaySignout.classList.add("hidden");
      }
    }
  });
}

function startListeners() {
  if (listenersStarted) return;
  listenersStarted = true;

  // Écoute en temps réel des transactions
  fs.onSnapshot(fs.query(fs.collection(db, "transactions"), fs.orderBy("ts", "desc")), (snap) => {
    transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAll();
  });

  // Écoute en temps réel du magasin
  fs.onSnapshot(fs.query(fs.collection(db, "shop"), fs.orderBy("cost", "asc")), (snap) => {
    shopItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderShop();
  });
}

function saveLocal() {
  localStorage.setItem("rp_transactions", JSON.stringify(transactions));
  localStorage.setItem("rp_shop", JSON.stringify(shopItems));
}

async function addTransaction(amount, reason) {
  const tx = { amount, reason, ts: Date.now() };
  if (useFirebase) {
    await fs.addDoc(fs.collection(db, "transactions"), tx);
  } else {
    transactions.unshift({ id: String(tx.ts), ...tx });
    saveLocal();
    renderAll();
  }
}

async function addShopItem(item) {
  if (useFirebase) {
    await fs.addDoc(fs.collection(db, "shop"), item);
  } else {
    shopItems.push({ id: String(Date.now()), ...item });
    shopItems.sort((a, b) => a.cost - b.cost);
    saveLocal();
    renderShop();
  }
}

async function deleteShopItem(id) {
  if (useFirebase) {
    await fs.deleteDoc(fs.doc(db, "shop", id));
  } else {
    shopItems = shopItems.filter(i => i.id !== id);
    saveLocal();
    renderShop();
  }
}

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);

function getBalance() {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

function showToast(msg) {
  const toast = $("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 2200);
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

/* ---------- Rendu ---------- */
function renderAll() {
  renderBalance();
  renderHistory();
  renderStats();
  renderShop();
}

function renderBalance() {
  $("balance").textContent = getBalance();
}

function renderPending() {
  const el = $("pending-amount");
  el.textContent = pending > 0 ? `+${pending}` : pending;
  el.classList.toggle("negative", pending < 0);
  el.classList.toggle("pending-zero", pending === 0);
  $("pending-label").textContent = pending === 0 ? "choisis des points" : "points en attente";
  $("confirm-btn").disabled = pending === 0;
  $("cancel-btn").classList.toggle("hidden", pending === 0);
}

function renderHistory() {
  const list = $("history-list");
  if (transactions.length === 0) {
    list.innerHTML = `<li class="empty-msg">Aucune transaction pour l'instant 💤</li>`;
    return;
  }
  list.innerHTML = transactions.map(t => `
    <li class="history-item">
      <span class="history-amount ${t.amount >= 0 ? "pos" : "neg"}">
        ${t.amount > 0 ? "+" : ""}${t.amount}
      </span>
      <div class="history-info">
        <div class="history-reason">${escapeHtml(t.reason) || "<i>sans raison</i>"}</div>
        <div class="history-date">${formatDate(t.ts)}</div>
      </div>
    </li>`).join("");
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Statistiques ---------- */
function getRangeStart(range) {
  const now = new Date();
  if (range === "day") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (range === "week") return Date.now() - 7 * 864e5;
  if (range === "month") return Date.now() - 30 * 864e5;
  if (range === "year") return Date.now() - 365 * 864e5;
  return 0; // all time
}

function renderStats() {
  const start = getRangeStart(currentRange);
  const inRange = transactions.filter(t => t.ts >= start);

  const gained = inRange.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const lost = inRange.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  $("stat-net").textContent = (gained + lost > 0 ? "+" : "") + (gained + lost);
  $("stat-gained").textContent = "+" + gained;
  $("stat-lost").textContent = lost;

  drawChart(start, inRange);
}

function buildBuckets(start) {
  // Retourne des tranches de temps adaptées à la période
  const buckets = [];
  const now = Date.now();
  let step, count, labelFn;

  if (currentRange === "day") {
    step = 3600e3; count = 24;
    labelFn = (d) => d.getHours() + "h";
  } else if (currentRange === "week") {
    step = 864e5; count = 7;
    labelFn = (d) => d.toLocaleDateString("fr-CA", { weekday: "short" });
  } else if (currentRange === "month") {
    step = 864e5; count = 30;
    labelFn = (d) => d.getDate() + "/" + (d.getMonth() + 1);
  } else if (currentRange === "year") {
    step = 30.4 * 864e5; count = 12;
    labelFn = (d) => d.toLocaleDateString("fr-CA", { month: "short" });
  } else {
    const first = transactions.length ? Math.min(...transactions.map(t => t.ts)) : now;
    const span = Math.max(now - first, 864e5);
    step = span / 12; count = 12;
    start = first;
    labelFn = (d) => d.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
  }

  const base = currentRange === "all" ? start : (currentRange === "day" ? start : now - step * count);
  for (let i = 0; i < count; i++) {
    const t0 = base + i * step;
    buckets.push({ t0, t1: t0 + step, label: labelFn(new Date(t0)) });
  }
  return buckets;
}

function drawChart(start, inRange) {
  const buckets = buildBuckets(start);
  // Solde cumulé: on part du solde avant la période
  const firstT0 = buckets.length ? buckets[0].t0 : 0;
  let running = transactions.filter(t => t.ts < firstT0).reduce((s, t) => s + t.amount, 0);
  const data = buckets.map(b => {
    running += transactions
      .filter(t => t.ts >= b.t0 && t.ts < b.t1)
      .reduce((s, t) => s + t.amount, 0);
    return running;
  });

  const ctx = $("stats-chart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: buckets.map(b => b.label),
      datasets: [{
        label: "Points",
        data,
        borderColor: "#fb6f92",
        backgroundColor: "rgba(255, 143, 171, 0.25)",
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointBackgroundColor: "#fb6f92"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: "rgba(251, 111, 146, 0.08)" } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }
      }
    }
  });
}

/* ---------- Magasin ---------- */
function shopIconHtml(icon) {
  if (!icon) return "🎁";
  // Si ça ressemble à un chemin ou une url d'image, on affiche l'image
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(icon) || icon.startsWith("http")) {
    return `<img src="${escapeHtml(icon)}" alt="">`;
  }
  return escapeHtml(icon);
}

function renderShop() {
  const list = $("shop-list");
  if (!list) return;
  const balance = getBalance();
  if (shopItems.length === 0) {
    list.innerHTML = `<li class="empty-msg">Le magasin est vide, ajoute des récompenses 🛍️</li>`;
    return;
  }
  list.innerHTML = shopItems.map(i => `
    <li class="shop-item">
      <span class="shop-icon">${shopIconHtml(i.icon)}</span>
      <div class="shop-info">
        <div class="shop-name">${escapeHtml(i.name)}</div>
        <div class="shop-cost">${i.cost} point${i.cost > 1 ? "s" : ""} 💗</div>
      </div>
      <button class="buy-btn" data-id="${i.id}" ${balance < i.cost ? "disabled" : ""}>Acheter</button>
      <button class="delete-item-btn" data-id="${i.id}" title="Supprimer">✕</button>
    </li>`).join("");

  list.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const item = shopItems.find(i => i.id === btn.dataset.id);
      if (!item || getBalance() < item.cost) return;
      await addTransaction(-item.cost, `🛍️ Achat: ${item.name}`);
      showToast(`${item.name} acheté! 🎉`);
    });
  });

  list.querySelectorAll(".delete-item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("Supprimer cet item du magasin?")) deleteShopItem(btn.dataset.id);
    });
  });
}

/* ---------- Navigation ---------- */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.page).classList.add("active");
    if (btn.dataset.page === "page-stats") renderStats();
  });
});

/* ---------- Page 1 : événements ---------- */
document.querySelectorAll(".point-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    pending += parseInt(btn.dataset.amount, 10);
    renderPending();
  });
});

$("cancel-btn").addEventListener("click", () => {
  pending = 0;
  renderPending();
});

$("confirm-btn").addEventListener("click", async () => {
  if (pending === 0) return;
  const reason = $("reason").value.trim();
  const amount = pending;
  pending = 0;
  $("reason").value = "";
  renderPending();
  await addTransaction(amount, reason);
  showToast(amount > 0 ? `+${amount} points d'amour! 💖` : `${amount} points... 💔`);
});

/* ---------- Page 4 : événements ---------- */
$("add-item-btn").addEventListener("click", () => {
  $("add-item-form").classList.toggle("hidden");
});

$("item-cancel").addEventListener("click", () => {
  $("add-item-form").classList.add("hidden");
});

$("add-item-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("item-name").value.trim();
  const cost = parseInt($("item-cost").value, 10);
  const icon = $("item-icon").value.trim();
  if (!name || !cost || cost < 1) return;
  await addShopItem({ name, cost, icon });
  e.target.reset();
  $("add-item-form").classList.add("hidden");
  showToast("Item ajouté au magasin! 🛍️");
});

/* ---------- Stats : sélecteur de période ---------- */
document.querySelectorAll(".range-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentRange = btn.dataset.range;
    renderStats();
  });
});

/* ---------- Démarrage de l'app ---------- */
setupCustomIcons();
renderPending();
initData();
