/* Budget Tracker: native layer for the iOS (Capacitor) build.
   Loaded in <head> by scripts/sync-app.mjs. On the web it does nothing except expose planReminders for tests. */
(function () {
  "use strict";
  const KEY = "budget-tracker:v2", REM_KEY = "budget-tracker:reminders", RESTORED = "bt-restored";
  const HOUR = 9;              // reminders arrive at 9:00 local time
  const DAYS_AHEAD = 45;       // look this far ahead
  const MAX = 60;              // iOS keeps at most 64 pending local notifications
  const SHOW_AMOUNT = false;   // false keeps dollar amounts off the lock screen
  const SHARE_BASE = "https://geiger12.github.io/BudgetTracker17/";

  /* ---------- pure scheduling logic (same rules as the app's occurrences()) ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const isoOf = (y, m, d) => y + "-" + pad(m + 1) + "-" + pad(d);
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return { y, m: m - 1, d }; };
  const dayNum = (y, m, d) => Math.round(Date.UTC(y, m, d) / 864e5);
  const fromDayNum = (n) => { const t = new Date(n * 864e5); return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate() }; };
  const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  function occurrences(item, y, m) {
    const out = [];
    if (item.type !== "bill") return out;
    if (item.freq === "biweekly" && item.anchor) {
      const a = parseISO(item.anchor), aN = dayNum(a.y, a.m, a.d), first = dayNum(y, m, 1), last = dayNum(y, m, daysIn(y, m));
      for (let d = aN + Math.ceil((first - aN) / 14) * 14; d <= last; d += 14) { const p = fromDayNum(d), due = isoOf(p.y, p.m, p.d); out.push({ due, key: item.id + "_" + due }); }
      return out;
    }
    const due = isoOf(y, m, Math.min(Math.max(1, Math.round(item.day || 1)), daysIn(y, m)));
    out.push({ due, key: item.id + "_" + due });
    return out;
  }
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return (h % 2147483000) + 1; };
  function planReminders(data, now) {
    now = now || new Date();
    const budgets = Object.values((data && data.budgets) || {}).filter((b) => b && !b.sample && Array.isArray(b.items));
    const multi = budgets.length > 1, plan = [], end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + DAYS_AHEAD, 23, 59);
    for (const b of budgets) {
      const pay = b.pay || {};
      for (const it of b.items) {
        for (let k = 0; k <= 2; k++) {
          const ref = new Date(now.getFullYear(), now.getMonth() + k, 1);
          for (const o of occurrences(it, ref.getFullYear(), ref.getMonth())) {
            if (pay[o.key]) continue;                                   // already marked paid
            const p = parseISO(o.due), dueDay = new Date(p.y, p.m, p.d, HOUR, 0, 0);
            const amt = SHOW_AMOUNT ? " ($" + (Number.isInteger(it.amount) ? it.amount : it.amount.toFixed(2)) + ")" : "";
            const body = it.name + amt + (multi ? " \u00b7 " + b.name : "");
            const eve = new Date(p.y, p.m, p.d - 1, HOUR, 0, 0);
            if (eve > now && eve <= end) plan.push({ id: hash(b.name + o.key + "e"), at: eve, title: "Bill due tomorrow", body });
            if (dueDay > now && dueDay <= end) plan.push({ id: hash(b.name + o.key + "d"), at: dueDay, title: "Bill due today", body });
          }
        }
      }
    }
    plan.sort((a, c) => a.at - c.at);
    const seen = new Set();
    return plan.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true))).slice(0, MAX);
  }
  const hasReal = (raw) => { try { return Object.values(JSON.parse(raw).budgets || {}).some((b) => !b.sample); } catch (e) { return false; } };

  const api = { planReminders, occurrences, hasReal };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window === "undefined") return;
  window.BTNative = api;

  const Cap = window.Capacitor;
  if (!(Cap && Cap.isNativePlatform && Cap.isNativePlatform())) return;     // web: nothing else to do
  window.SHARE_BASE = SHARE_BASE;                                           // shared links point at the web version
  const P = Cap.Plugins || {}, LN = P.LocalNotifications, Prefs = P.Preferences, Hap = P.Haptics, AppPl = P.App;
  const origSet = Storage.prototype.setItem;

  /* ---------- keep a second copy of the budgets in native storage ---------- */
  let checked = false, pending = null;
  const mirror = (v) => { if (!Prefs) return; if (!checked) { pending = v; return; } Prefs.set({ key: KEY, value: v }).catch(() => {}); };
  Storage.prototype.setItem = function (k, v) {
    origSet.call(this, k, v);
    if (this === window.localStorage && k === KEY) { mirror(v); soon(); }
  };
  (async function restoreCheck() {
    try {
      if (!Prefs) { checked = true; return; }
      const saved = (await Prefs.get({ key: KEY })).value, local = localStorage.getItem(KEY);
      if (saved && hasReal(saved) && !hasReal(local || "") && !sessionStorage.getItem(RESTORED)) {   // storage was wiped: bring the budgets back
        sessionStorage.setItem(RESTORED, "1"); origSet.call(localStorage, KEY, saved); location.reload(); return;
      }
    } catch (e) { /* keep going without the copy */ }
    checked = true;
    const cur = localStorage.getItem(KEY); if (pending || cur) mirror(pending || cur); pending = null;
  })();

  /* ---------- bill reminders ---------- */
  const enabled = () => localStorage.getItem(REM_KEY) === "on";
  let timer = null;
  function soon() { clearTimeout(timer); timer = setTimeout(schedule, 1500); }
  async function schedule() {
    if (!LN || !enabled()) return;
    try {
      if ((await LN.checkPermissions()).display !== "granted") return;
      const cur = await LN.getPending();
      if (cur.notifications && cur.notifications.length) await LN.cancel({ notifications: cur.notifications.map((n) => ({ id: n.id })) });
      const raw = localStorage.getItem(KEY), plan = raw ? planReminders(JSON.parse(raw), new Date()) : [];
      if (plan.length) await LN.schedule({ notifications: plan.map((p) => ({ id: p.id, title: p.title, body: p.body, schedule: { at: p.at, allowWhileIdle: true } })) });
    } catch (e) { /* reminders are a bonus; never break the app */ }
  }
  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.append(t);
    setTimeout(() => t.remove(), 4200);
  }
  async function toggleReminders() {
    if (!LN) { toast("Reminders aren\u2019t available in this build."); return; }
    if (enabled()) {
      localStorage.setItem(REM_KEY, "off");
      try { const cur = await LN.getPending(); if (cur.notifications.length) await LN.cancel({ notifications: cur.notifications.map((n) => ({ id: n.id })) }); } catch (e) { /* ignore */ }
      toast("Bill reminders are off."); inject(); return;
    }
    let perm; try { perm = await LN.requestPermissions(); } catch (e) { perm = { display: "denied" }; }
    if (perm.display === "granted") { localStorage.setItem(REM_KEY, "on"); await schedule(); toast("Bill reminders are on. You\u2019ll get a note at 9:00 the day before and on the day."); }
    else toast("Notifications are off for this app. Turn them on in Settings, then try again.");
    inject();
  }

  /* ---------- menu item, added to the app's slide-out menu ---------- */
  function menuItem(id, d, text, fn) {
    const NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"), path = document.createElementNS(NS, "path");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("aria-hidden", "true"); path.setAttribute("d", d); svg.append(path);
    const label = document.createElement("span"); label.className = "grow"; label.textContent = text;
    const btn = document.createElement("button"); btn.className = "menu-item"; btn.id = id; btn.append(svg, label); btn.addEventListener("click", fn);
    return btn;
  }
  function inject() {
    const body = document.querySelector("#drawer .drawer-body"); if (!body) return;
    for (const id of ["menuReminders", "menuLock"]) { const old = body.querySelector("#" + id); if (old) old.remove(); }
    const note = body.querySelector(".drawer-note");
    body.insertBefore(menuItem("menuReminders", "M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0", enabled() ? "Bill reminders: on" : "Turn on bill reminders", toggleReminders), note || null);
    body.insertBefore(menuItem("menuLock", "M7 11V8a5 5 0 0110 0v3M5 11h14v10H5z", lockOn() ? "Face ID lock: on" : "Turn on Face ID lock", toggleLock), note || null);
  }
  function boot() {
    const d = document.getElementById("drawer");
    if (d) { new MutationObserver(inject).observe(d, { childList: true }); inject(); }
    soon();
  }

  /* ---------- Face ID lock ---------- */
  const BA = P.BiometricAuth, LOCK_KEY = "budget-tracker:lock", GRACE = 15000;   // no prompt if you are back within 15 seconds
  const lockOn = () => localStorage.getItem(LOCK_KEY) === "on";
  const AUTH = { reason: "Unlock Budget Tracker", cancelTitle: "Cancel", allowDeviceCredential: true, iosFallbackTitle: "Use passcode" };
  let overlay = null, locked = false, authing = false, awayAt = Date.now();
  function cover(show) {
    if (!overlay) {
      overlay = document.createElement("div"); overlay.id = "btLock"; overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-label", "Budget Tracker is locked");
      overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:#2ebfd9;color:#1f2933;display:none;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center;padding:24px;font:700 22px/1.3 -apple-system,BlinkMacSystemFont,sans-serif";
      const t = document.createElement("div"); t.textContent = "Budget Tracker is locked";
      const b = document.createElement("button"); b.id = "btUnlock"; b.textContent = "Unlock"; b.addEventListener("click", unlock);
      b.style.cssText = "min-height:48px;padding:0 28px;border:3px solid #1f2933;border-radius:14px;background:#fdcb2f;color:#1f2933;font:700 18px -apple-system,sans-serif;box-shadow:5px 5px 0 #1f2933";
      overlay.append(t, b); (document.body || document.documentElement).append(overlay);
    }
    overlay.style.display = show ? "flex" : "none";
  }
  async function unlock() {
    if (!BA || authing) return;
    authing = true;
    try { await BA.authenticate(AUTH); locked = false; awayAt = Date.now(); cover(false); }
    catch (e) { /* stays locked; the Unlock button tries again */ }
    finally { authing = false; }
  }
  async function toggleLock() {
    if (!BA) { toast("The Face ID lock isn\u2019t available in this build."); return; }
    authing = true;
    try {
      const info = await BA.checkBiometry();
      if (!info.isAvailable && !info.deviceIsSecure) { toast("Set up Face ID or a passcode in Settings first."); return; }
      await BA.authenticate(Object.assign({}, AUTH, { reason: lockOn() ? "Turn off the lock" : "Turn on the lock" }));
    } catch (e) { toast("The lock wasn\u2019t changed."); return; }
    finally { authing = false; awayAt = Date.now(); }
    if (lockOn()) { localStorage.setItem(LOCK_KEY, "off"); toast("The lock is off."); }
    else { localStorage.setItem(LOCK_KEY, "on"); toast("The lock is on. The app asks for Face ID when you come back."); }
    inject();
  }
  if (BA && lockOn()) { locked = true; cover(true); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", unlock); else unlock(); }
  if (AppPl && AppPl.addListener) AppPl.addListener("appStateChange", (s) => {
    if (!BA || !lockOn() || authing) return;
    if (!s.isActive) { awayAt = Date.now(); cover(true); return; }       // also hides budgets in the app switcher
    if (locked || Date.now() - awayAt > GRACE) { locked = true; cover(true); unlock(); } else cover(false);
  });

  /* ---------- a light tap when a bill switch is flipped ---------- */
  if (Hap) document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest(".sw")) Hap.impact({ style: "LIGHT" }).catch(() => {}); }, true);

  /* ---------- start (last, so everything above is defined) ---------- */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  if (AppPl && AppPl.addListener) AppPl.addListener("appStateChange", (s) => { if (s.isActive) soon(); });
})();
