# 🌿 Productivity Hub

> **🌐 Language:** **English (this page)** · [中文说明](README.zh-CN.md)

> Ezra's personal productivity workbench · Nordic-nature aesthetic · 100% local privacy

A single-page productivity tool designed for PhD students (especially those working in research labs), bundling Pomodoro, tasks, habit tracking, SRS flashcards, ambient sounds, notes, and a paper-reading queue.

**Static-only, no backend, no tracking, no login.** All data lives in your browser's localStorage.

---

## 📋 Table of contents

- [Quick start](#-quick-start)
- [Deploy to GitHub Pages](#-deploy-to-github-pages)
- [File structure](#-file-structure)
- [Module reference](#-module-reference)
- [Data & privacy](#-data--privacy)
- [Shortcuts](#-shortcuts)
- [Responsive & browser support](#-responsive--browser-support)
- [Customization guide](#-customization-guide)
- [FAQ](#-faq)
- [Tech stack](#-tech-stack)

---

## 🚀 Quick start

1. **Open the page** — go to `https://<your-username>.github.io/Productivity-Hub/`
2. **First load** — every module is pre-seeded with sample data (lab tasks, habits, flashcards, etc.) so you can try it immediately
3. **Start using it** — check off tasks, click habit cells, hit Start on the Pomodoro; every change auto-saves locally
4. **Recommended first step** — click the cylinder icon (💾) in the top-right → **Export backup**, save a baseline so you can recover later

---

## 🌐 Deploy to GitHub Pages

### First-time deploy

Push every file below to the root of your GitHub repo:

```
index.html
styles.css
favicon.svg
icons.jsx
shell.jsx
cards.jsx
cards-learn.jsx
app.jsx
sounds.js
storage.js
README.md
README.zh-CN.md
```

Then:

1. Go to the repo → **Settings** → **Pages**
2. **Source** → `Deploy from a branch`
3. **Branch** → `main` (or `master`), **Folder** → `/ (root)`
4. Click **Save**. After 1–2 minutes you'll get `https://<username>.github.io/<repo>/`

### Updates

Edit, commit, push — GitHub Pages rebuilds automatically within a few minutes.

> **Note:** Filenames are case-sensitive. `index.html` must be lowercase, or Pages won't find the entry.

---

## 📁 File structure

```
.
├── index.html              # Entry — loads fonts + scripts
├── styles.css              # All styles (responsive + dark mode)
├── favicon.svg             # Site icon
│
├── icons.jsx               # Lucide-style SVG icon library
├── shell.jsx               # Sidebar + Topbar (nav, weather, lang switch)
├── cards.jsx               # Pomodoro / Countdown / Tasks / Habits / Stats / Notes
├── cards-learn.jsx         # Flashcards / Sounds / Papers
├── app.jsx                 # React root + state + Data menu
│
├── sounds.js               # Procedural ambient sounds via Web Audio (no audio files)
├── storage.js              # localStorage wrapper + time helpers + useStorage hook
│
├── README.md               # This file (English)
└── README.zh-CN.md         # Chinese version
```

**Single-responsibility principle:**
- `cards.jsx` — time / tasks / habits / stats / notes (core productivity)
- `cards-learn.jsx` — learning-related (flashcards / sounds / papers)
- `storage.js` — all persistence logic
- `sounds.js` — all audio synthesis

---

## 🧩 Module reference

### 🍅 Pomodoro · Deep Work

Classic Pomodoro: 25 min work / 5 min short break / 15 min long break every 4 rounds.

**Controls:**
- **Start / Pause** — start or pause the timer
- **Skip** — jump to the next phase
- **+5 min** — extend current phase by 5 minutes
- **Reset ↺** — fully reset the current session

**Features:**
- Progress ring updates live
- Auto-transitions work → short break → work → long break (after 4)
- Each completed work pomodoro **increments today's count** (the Stats bar chart reflects it immediately)
- 4-segment progress bar shows current session position

---

### ⏰ Upcoming · Countdown

Live countdown to your next event (paper deadline, qualifying exam, group meeting…).

**Logic:**
- Auto-sorts by date; nearest upcoming event becomes the main countdown
- Days / Hours / Min / Sec, **refreshes every second**
- Three more events listed below as "in N d / today / tomorrow"
- Events expired by 7+ days are hidden

**Custom events:** see [Customization → Events](#custom-events)

---

### ✅ Tasks

Tasks grouped by project (default: Lab work / Writing / Personal · Spanish).

**Features:**
- **Click the checkbox or task text** — toggle done
- **Filter tabs** — All / Today / Upcoming / Overdue
- **Priority tags** — P1 (high, orange-rust) / P2 (med, sand) / P3 (low, green)
- **Due labels** — "Today / Tomorrow / in N d / Overdue Nd", **computed live**
- Drag handle (reserved UI, sorting not enabled yet)

**Task state persists** — refresh and your changes stay.

---

### 🌱 Habits · last 7 days

Rolling 7-day heatmap, one row per habit.

**Controls:**
- **Click a cell** — cycle through three states:
  - empty (not done)
  - half (light green)
  - full (deep green)
- The rightmost cell is **always today**, outlined in black
- The day letters **rotate dynamically** based on the real date (e.g. if today is Monday, the header reads `T W T F S S M`)

**Streak counter (🔥):**
- Counts consecutive days back from today with any check (half or full)
- Breaks if you miss a day
- Shown next to the habit name

---

### 📊 Focus · last 7 days

Pomodoro history bar chart.

**Display:**
- **Real data!** — reads your past 7 days of completed pomodoros
- Today (rightmost bar) starts at 0; finishing a pomodoro bumps it to 1
- Target: 4/day; bars scale to `max(8, actual peak)`
- Three stats:
  - **This week** — total pomodoros
  - **Total focus time** — `H h M m`
  - **Days hit target** — % of days with ≥ 4

Switch to **All time** tab for cumulative count.

---

### 📚 Flashcards · SRS

Spaced-repetition flashcards, 3 built-in decks:

| Deck | Content | Cards |
|---|---|---|
| 🇪🇸 Spanish · A2 vocab | A2 Spanish vocabulary (aprovechar, alcanzar…) | 6 |
| 🇪🇸 Subjuntivo phrases | Subjunctive expressions (Ojalá que…, Aunque sea…) | 3 |
| 🔋 Battery terminology | Li-battery terms (Coulombic efficiency, SEI, Dendrite) | 3 |

**Flow:**
1. See the front, recall the answer
2. **Click the card** or press **Reveal →**
3. Rate your recall:
   - **Again** (<1m) — redo immediately
   - **Hard** (6m) — 6 min later
   - **Good** (1d) — tomorrow
   - **Easy** (4d) — 4 days later
4. Auto-advances to next card

**Deck list at the bottom** — click to switch decks; the active deck is highlighted.

**Reset today** — clear today's review count, useful for "re-practice from scratch".

---

### 🌊 Ambient · focus mix

**Fully procedural ambient sounds** — no audio files needed, works 100% on GitHub Pages.

6 soundscapes:

| Soundscape | Implementation |
|---|---|
| Ocean waves | Brown noise + lowpass + LFO-modulated gain (~5.5 s wave period) |
| Rain · leaves | Pink noise + highpass + short sine droplets |
| Café · soft | Pink noise + bandpass at speech frequencies + occasional clinks |
| Fireplace | Brown noise + lowpass + highpass crackle bursts |
| Forest dawn | Pink noise + lowpass + occasional bird-like sines |
| Brown noise | Pure 1/f² noise — the "warmest" white noise |

**Controls:**
- **Click a tile** — toggle play/stop
- **Volume slider** — 0–100%
- **Play / Pause** — pause the active soundscape

> ⚠️ **Browser policy:** First playback needs user interaction (any click). Chrome / Safari block autoplay by default.

---

### 📝 Recent notes

Markdown-style note cards (4 sample notes shipped).

- Title + 3-line snippet + tag + updated date
- Hover lifts the card with a soft shadow
- Date shown as "X d ago / X w ago" — **computed live**

> Read-only for now. Editing UI can be added later (see "next steps" at the bottom).

---

### 🌿 Paper queue

Reading queue (4 default papers on Li-metal anodes).

**Controls:**
- **Click a paper** — reading progress +10% (0 → 10 → … → 100)
- Shows journal + relative-time added ("2 d ago" etc.)
- Progress bar appears only after first click
- Progress persists

---

### ☀️ Weather widget (topbar)

Real-time weather for **Xi'an Chang'an district** (34.16°N, 108.93°E) via **Open-Meteo API**:
- Current temperature
- Condition (Clear / Overcast / Light rain / Snow…)
- Translates to EN / ES automatically

**Free + no API key + privacy-friendly** — Open-Meteo needs no registration, no token, just an anonymous GET.

If offline / API down, it shows "Weather unavailable" without breaking anything else.

---

## 🔐 Data & privacy

### Where does data live?

**Only in this browser's localStorage.**

Open DevTools (F12) → Application → Local Storage → your domain. You'll see keys with the `phub.` prefix:

| Key | Contents |
|---|---|
| `phub.settings` | Language, dark mode |
| `phub.tasks` | Groups + all task items |
| `phub.habits` | Habits + per-date check map |
| `phub.pomodoro` | `daily: { "2026-05-19": 4, ... }` |
| `phub.flashcards` | Daily SRS counts |
| `phub.papers` | Papers + read % + added date |
| `phub.events` | Countdown events |
| `phub.notes` | Notes |

### Who can see it?

- ✅ You (in this browser, on this device)
- ❌ GitHub
- ❌ Claude / me
- ❌ Open-Meteo (only knows someone asked for Xi'an weather, anonymous IP)
- ❌ Anyone else / any third-party service

### When can data be lost?

- Clear browser cache / cookies
- Switch to private / incognito mode
- Different browser (Chrome's data isn't in Safari)
- Different machine
- Browser hits storage quota (rare, ~5–10 MB limit)

### Backup & restore

**Export:**
1. Click the cylinder icon 💾 (top-right or sidebar foot)
2. **Export backup (.json)** → downloads `productivity-hub-backup-2026-05-19.json`
3. Save it to OneDrive / Google Drive / email yourself / external drive

**Import:**
1. Same menu → **Import backup**
2. Pick the JSON file
3. Page auto-reloads with restored data

**Wipe everything:**
- **Reset all data** — wipes every `phub.*` key (with confirmation)
- **Strongly recommended: Export first!**

### Cross-device sync?

**Not supported.** Static hosting means no cloud account system. Options:
- Manual Export → Import (good for occasional sync, e.g. switching machines)
- Or sync your browser profile via Syncthing / iCloud / OneDrive (advanced)

For true real-time sync, you'd need a backend (Firebase / Supabase), which sacrifices the privacy guarantee.

---

## ⌨️ Shortcuts

| Key / action | Effect |
|---|---|
| `Esc` | Close sidebar drawer / Data menu |
| Click backdrop | Close sidebar drawer / Data menu |
| Tap sidebar item (mobile) | Switch page + auto-close drawer |
| Click a paper | +10% progress |
| Click a habit cell | Cycle state (0 → 1 → 2 → 0) |
| Click task text | Toggle done |

Future shortcuts (not yet wired): space = start/pause Pomodoro, `N` = new task, `/` = focus search.

---

## 📱 Responsive & browser support

### Breakpoints

| Viewport | Layout |
|---|---|
| **≥ 1025px** | Desktop: 240px sidebar + 12-col grid |
| **721–1024px** | Tablet: hamburger menu + 2-col card layout |
| **421–720px** | Phone: single column, Pomodoro ring centered |
| **≤ 420px** | Narrow phone: tighter, lang switch hidden into Data menu |

### Browser requirements

- **Chrome / Edge / Safari / Firefox** modern versions (last 2–3 years)
- Required: `localStorage`, Web Audio API, CSS Grid, ES6+
- IE11 not supported

---

## 🛠 Customization guide

### Change your name / role

In `shell.jsx`, find the `sidebar-foot` block:

```jsx
<div className="avatar">EZ</div>            // initials shown
<div className="user-name">Ezra</div>       // name
<div className="user-role">PhD · Li-metal anode</div>  // role
```

### Change the weather location

Constants near the top of `shell.jsx`:

```js
const XIAN_LAT = 34.16;
const XIAN_LON = 108.93;
```

Set to whatever coordinates you want (Google "<city> latitude longitude" works fine).

### <a id="custom-events"></a>Custom events

Easiest: open DevTools Console and write directly:

```js
PHub.Storage.set("events", [
  { id: "e1", title: { en: "My event", es: "Mi evento" }, dateTime: "2026-06-15T14:00:00", venue: "Lab A" }
]);
location.reload();
```

Or edit `PHub.seeds.events()` in `cards.jsx` and reset all data to re-seed.

### Custom tasks

Console:

```js
const t = PHub.Storage.get("tasks");
t.items.push({
  id: "tNew",
  groupId: "lab",
  text: { en: "New task", es: "Nueva tarea" },
  priority: "high",
  dueISO: PHub.Time.daysFromNow(2),
  done: false
});
PHub.Storage.set("tasks", t);
location.reload();
```

### Add a flashcard deck

In `cards-learn.jsx`, add to the `DECKS` object:

```js
DECKS.myDeck = {
  icon: "🇫🇷",
  name: { en: "French · A1", es: "Francés · A1" },
  accent: "var(--rust)",
  cards: [
    { word: "bonjour", phon: "/bɔ̃.ʒuʁ/", tag: { en: "greeting", es: "saludo" }, back: { en: "hello", es: "hola" }, example: { en: "Bonjour!", es: "Bonjour!" } },
    // ...
  ],
};
```

### Change theme colors

In `styles.css`, the `:root` block at the top:

```css
--sage: #7a9b86;        /* primary accent */
--sage-deep: #5e7d6a;
--sand: #c8a87a;        /* secondary accent */
--rust: #b06b50;
```

---

## ❓ FAQ

**Q: My data is gone after refresh?**
A: Check if you're in private / incognito mode — localStorage is wiped at session end there. Use a normal window.

**Q: Weather won't load?**
A:
- Check your network
- Open-Meteo has occasional brief outages (self-heal in minutes)
- Generally fine from inside China, but extreme network conditions can be slow
- Doesn't affect anything else

**Q: No sound from ambient mix?**
A:
- Browsers block autoplay by default — **click anywhere on the page** first to unlock the audio context
- Check the volume slider isn't at 0
- Check OS volume
- Safari may require allowing sound for the site (icon in address bar)

**Q: Will the Pomodoro freeze if I switch tabs?**
A: No. `setInterval` gets throttled to 1 Hz in background, but the elapsed time stays accurate. When you come back, the displayed remaining time is correct.

**Q: Where do I see my Pomodoro count?**
A:
- Card subtitle: "Session N of 4 · X completed today"
- Stats card's today bar
- Persists across tab switches / restarts

**Q: How do I wipe everything and start fresh?**
A: Data menu → **Reset all data** → confirm. One second.

**Q: After switching language, my tasks/notes are blank?**
A: All shipped seed data has both EN + ES. If you manually added a task with only English, ES mode will show `undefined`. Fill in the other language to fix.

**Q: Works on mobile?**
A: Yes. Same URL, responsive layout adapts. Hamburger → sidebar.

**Q: How do I sync to the cloud?**
A: By design, this is privacy-first with no cloud sync. Manual Export → save the JSON to whichever cloud drive you trust.

---

## 🧪 Tech stack

- **HTML / CSS / vanilla JS** — zero build step
- **React 18** (UMD via CDN) — UI components
- **Babel Standalone** — in-browser JSX transpile
- **Geist + Geist Mono** (Google Fonts) — typography
- **Open-Meteo** — weather API (free, no key, CORS-friendly)
- **Web Audio API** — procedural ambient sounds
- **localStorage** — data persistence

> Design principle: **no dependencies, no backend, no tracking.** CDNs (unpkg / Google Fonts) are only used for the React runtime and fonts.

---

## 📜 License

Personal use. Modify freely.

---

🌿 *Build something you'll actually use.* — Ezra's research desk, 2026
