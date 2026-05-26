/* ============================================
   Storage + Time helpers
   100% localStorage — never leaves the browser.
   ============================================ */
window.PHub = window.PHub || {};

PHub.Storage = {
  PREFIX: "phub.",
  get(key, fallback) {
    try {
      const v = localStorage.getItem(this.PREFIX + key);
      return v != null ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(this.PREFIX + key, JSON.stringify(val)); } catch (e) {}
  },
  remove(key) {
    try { localStorage.removeItem(this.PREFIX + key); } catch (e) {}
  },
  resetAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
  exportAll() {
    const data = { _exportedAt: new Date().toISOString(), _app: "Productivity Hub" };
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => {
        try { data[k.slice(this.PREFIX.length)] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
      });
    return data;
  },
  importAll(json) {
    if (!json || typeof json !== "object") return false;
    Object.keys(json).forEach(k => {
      if (k.startsWith("_")) return;
      this.set(k, json[k]);
    });
    return true;
  },
};

const pad2 = (n) => String(n).padStart(2, "0");
const dateToISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

PHub.Time = {
  todayISO() {
    return dateToISO(new Date());
  },
  daysFromNow(n) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return dateToISO(d);
  },
  // returns ISO strings for [6 days ago, ..., today]
  last7DaysISO() {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      out.push(dateToISO(d));
    }
    return out;
  },
  // day-of-week labels for the same window, lang-aware
  last7DayLabels(lang) {
    const en = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    const es = ["DOM","LUN","MAR","MIE","JUE","VIE","SAB"];
    const arr = lang === "ES" ? es : en;
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(arr[d.getDay()]);
    }
    return out;
  },
  // single-letter labels for the habit grid
  last7DayLetters(lang) {
    const en = ["S","M","T","W","T","F","S"];
    const es = ["D","L","M","X","J","V","S"];
    const arr = lang === "ES" ? es : en;
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(arr[d.getDay()]);
    }
    return out;
  },
  // "Today" / "Tomorrow" / "in 3 d" / "Overdue 2 d" / a date
  dueLabel(dueISO, lang) {
    if (!dueISO) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(dueISO + "T00:00:00"); due.setHours(0,0,0,0);
    const diff = Math.round((due - today) / 86400000);
    if (diff === 0) return { text: lang === "ES" ? "Hoy" : "Today", cls: "due-today" };
    if (diff === 1) return { text: lang === "ES" ? "Mañana" : "Tomorrow", cls: "" };
    if (diff < 0) return { text: lang === "ES" ? `Atrasada ${-diff}d` : `Overdue ${-diff}d`, cls: "due-soon" };
    if (diff < 7) return { text: lang === "ES" ? `en ${diff} d` : `in ${diff} d`, cls: "" };
    return {
      text: due.toLocaleDateString(lang === "ES" ? "es-ES" : "en-US", { month: "short", day: "numeric" }),
      cls: ""
    };
  },
  // "today" / "2 d ago" / "3 w ago" / "May 13"
  relativePast(dateISO, lang) {
    const then = new Date(dateISO + (dateISO.length === 10 ? "T00:00:00" : ""));
    const now = new Date();
    const diff = Math.floor((now - then) / 86400000);
    if (diff <= 0) return lang === "ES" ? "hoy" : "today";
    if (diff === 1) return lang === "ES" ? "ayer" : "yesterday";
    if (diff < 7) return lang === "ES" ? `hace ${diff} d` : `${diff} d ago`;
    if (diff < 35) return lang === "ES" ? `hace ${Math.floor(diff/7)} sem` : `${Math.floor(diff/7)} w ago`;
    return then.toLocaleDateString(lang === "ES" ? "es-ES" : "en-US", { month: "short", day: "numeric" });
  },
  weekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  },
};

/* ============================================
   useStorage — React hook synced to localStorage
   ============================================ */
PHub.useStorage = function(key, initFactory) {
  const { useState, useEffect, useRef } = React;
  const [val, setVal] = useState(() => {
    const stored = PHub.Storage.get(key, null);
    if (stored != null) return stored;
    return typeof initFactory === "function" ? initFactory() : initFactory;
  });
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return; }
    PHub.Storage.set(key, val);
  }, [val]);
  return [val, setVal];
};

/* ============================================
   Trigger a download of any JSON blob
   ============================================ */
PHub.downloadJSON = function(data, filename) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "productivity-hub-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) { console.error(e); }
};
