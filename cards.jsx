/* ============================================
   Dashboard cards — backed by localStorage
   ============================================ */

const { useState, useEffect, useRef, useMemo } = React;
const tT = (lang, en, es) => (lang === "ES" ? es : en);
const T = PHub.Time;

/* ============================================
   Seed factories — used on first run
   ============================================ */
PHub.seeds = {
  tasks: () => ({
    groups: [
      { id: "lab", name: { en: "Lab work", es: "Laboratorio" }, color: "var(--sage-deep)" },
      { id: "writing", name: { en: "Writing", es: "Escritura" }, color: "#8a6a32" },
      { id: "personal", name: { en: "Personal · Spanish", es: "Personal · Español" }, color: "#5d7d8a" },
    ],
    items: [
      { id: "t1", groupId: "lab", text: { en: "Disassemble coin cells from cycler 3 (Cu‖Li, 0.5 mA cm⁻²)", es: "Desmontar coin cells del cycler 3 (Cu‖Li, 0.5 mA cm⁻²)" }, priority: "high", dueISO: T.daysFromNow(0), done: true },
      { id: "t2", groupId: "lab", text: { en: "Image SEI on Li deposit — cryo-EM session 2", es: "Imágenes SEI en depósito de Li — cryo-EM sesión 2" }, priority: "med", dueISO: T.daysFromNow(1), done: true },
      { id: "t3", groupId: "lab", text: { en: "Run EIS on freshly plated samples (10⁻²–10⁵ Hz)", es: "EIS en muestras recién plateadas (10⁻²–10⁵ Hz)" }, priority: "high", dueISO: T.daysFromNow(0), done: false },
      { id: "t4", groupId: "lab", text: { en: "Refill Ar glovebox — water/O₂ < 0.1 ppm check", es: "Recargar glovebox Ar — H₂O/O₂ < 0.1 ppm" }, priority: "low", dueISO: T.daysFromNow(2), done: false },
      { id: "t5", groupId: "lab", text: { en: "Prepare LiFSI/DME electrolyte (1.2 M, 50 mL)", es: "Preparar electrolito LiFSI/DME (1.2 M, 50 mL)" }, priority: "med", done: true },
      { id: "t6", groupId: "writing", text: { en: "Revise figure 4 — Coulombic efficiency vs cycle number", es: "Revisar figura 4 — CE vs número de ciclos" }, priority: "high", dueISO: T.daysFromNow(1), done: false },
      { id: "t7", groupId: "writing", text: { en: "Reply to reviewer #2 — XPS depth profile request", es: "Responder al revisor #2 — perfil XPS" }, dueISO: T.daysFromNow(-1), done: true },
      { id: "t8", groupId: "writing", text: { en: "Draft introduction · dendrite suppression review", es: "Borrador intro · revisión supresión dendritas" }, priority: "med", dueISO: T.daysFromNow(4), done: false },
      { id: "t9", groupId: "personal", text: { en: "Spanish · 15 min flashcards (deck: Conditional tense)", es: "Español · 15 min tarjetas (condicional)" }, priority: "low", dueISO: T.daysFromNow(0), done: false },
    ],
  }),
  habits: () => {
    const d = T.last7DaysISO();
    return [
      { id: "h1", name: { en: "Read 1 research paper", es: "Leer 1 paper" }, color: "#7a9b86", checks: { [d[0]]: 2, [d[1]]: 2, [d[2]]: 2, [d[3]]: 1, [d[4]]: 2 } },
      { id: "h2", name: { en: "Lab notebook entry", es: "Entrada en cuaderno" }, color: "#c8a87a", checks: { [d[0]]: 2, [d[1]]: 2, [d[2]]: 2, [d[3]]: 2, [d[4]]: 2 } },
      { id: "h3", name: { en: "Spanish · 15 min", es: "Español · 15 min" }, color: "#b06b50", checks: { [d[0]]: 2, [d[2]]: 2, [d[3]]: 2, [d[4]]: 1 } },
      { id: "h4", name: { en: "Walk · 30 min outdoors", es: "Caminar · 30 min" }, color: "#8aa9b8", checks: { [d[0]]: 2, [d[1]]: 2, [d[3]]: 2, [d[4]]: 2 } },
      { id: "h5", name: { en: "No phone before 9am", es: "Sin móvil antes 9am" }, color: "#a48ac6", checks: { [d[0]]: 2, [d[1]]: 2, [d[2]]: 2, [d[3]]: 2, [d[4]]: 2 } },
      { id: "h6", name: { en: "Sleep before midnight", es: "Dormir antes de medianoche" }, color: "#7a9b86", checks: { [d[0]]: 1, [d[1]]: 2, [d[2]]: 1, [d[3]]: 2 } },
    ];
  },
  pomodoro: () => {
    const d = T.last7DaysISO();
    return {
      daily: { [d[0]]: 5, [d[1]]: 6, [d[2]]: 4, [d[3]]: 7, [d[4]]: 3, [d[5]]: 2 },
      // today (d[6]) starts at 0 — it grows from user's real usage
    };
  },
  flashcards: () => ({ doneToday: {} }),
  papers: () => [
    { id: "p1", title: { en: "Anode-free Li metal batteries with localized high-concentration electrolyte", es: "Baterías Li metal sin ánodo con electrolito localizado" }, journal: "Nature Energy · 2025", addedAtISO: T.daysFromNow(-2), read: 78 },
    { id: "p2", title: { en: "Operando cryo-EM of Li dendrite nucleation at fast rates", es: "Cryo-EM operando · nucleación de dendritas a alta velocidad" }, journal: "Joule · 2024", addedAtISO: T.daysFromNow(-4), read: 42 },
    { id: "p3", title: { en: "Solvent-derived SEI engineering for high-CE Li metal anodes", es: "Ingeniería SEI para ánodos Li de alta CE" }, journal: "ACS Energy Lett. · 2025", addedAtISO: T.daysFromNow(-9), read: 0 },
    { id: "p4", title: { en: "Pressure effects on Li plating uniformity in pouch cells", es: "Efectos de presión en pouch cells" }, journal: "J. Power Sources · 2024", addedAtISO: T.daysFromNow(-12), read: 0 },
  ],
  events: () => [
    { id: "e1", title: { en: "Qualifying exam · oral defense", es: "Examen de calificación · defensa oral" }, dateTime: T.daysFromNow(23) + "T14:00:00", venue: "Noyes 153" },
    { id: "e2", title: { en: "Manuscript revision · J. Power Sources", es: "Manuscrito · J. Power Sources" }, dateTime: T.daysFromNow(9) + "T23:59:00" },
    { id: "e3", title: { en: "Cell cycling test ends", es: "Fin del test de cycling" }, dateTime: T.daysFromNow(3) + "T18:00:00" },
    { id: "e4", title: { en: "DOE quarterly report", es: "Informe trimestral DOE" }, dateTime: T.daysFromNow(28) + "T23:59:00" },
  ],
  notes: () => [
    { id: "n1", pinned: true, title: { en: "SEI formation · LiFSI/DME", es: "Formación SEI · LiFSI/DME" }, snippet: { en: "F-rich inorganic layer dominates at high salt concentration. Compare with baseline carbonate — note dendrite morphology shift...", es: "Capa inorgánica rica en F domina a alta concentración. Comparar con carbonato base..." }, tag: "research", tagColor: "sage", updatedISO: T.daysFromNow(-2) },
    { id: "n2", title: { en: "Cycling protocol v3", es: "Protocolo cycling v3" }, snippet: { en: "1) Pre-cycle: 3× formation at C/20 between 2.8–4.3 V. 2) Long cycling at C/3. 3) Reference @ C/10 every 20 cycles...", es: "1) Pre-ciclo 3× a C/20 entre 2.8–4.3 V. 2) Cycling largo a C/3. 3) Ref @ C/10 cada 20..." }, tag: "protocol", updatedISO: T.daysFromNow(-3) },
    { id: "n3", title: { en: "Meeting · Prof. K · weekly", es: "Reunión · Prof. K · semanal" }, snippet: { en: "Action items: (a) finish CE plot before Wed (b) check whether 3D current collector helps at 5 mA cm⁻²...", es: "Pendientes: (a) terminar gráfica CE antes del miércoles (b) verificar colector 3D..." }, tag: "meeting", tagColor: "sky", updatedISO: T.daysFromNow(-4) },
    { id: "n4", title: { en: "Spanish · subjuntivo tips", es: "Español · subjuntivo" }, snippet: { en: "WEIRDO: Wishes, Emotions, Impersonal expressions, Recommendations, Doubt, Ojalá. Practice with...", es: "WEIRDO: deseos, emociones, expresiones impersonales, recomendaciones, duda, ojalá..." }, tag: "español", tagColor: "rust", updatedISO: T.daysFromNow(-5) },
  ],
};

/* ============================================
   POMODORO
   ============================================ */
const POMO_WORK = 25 * 60;
const POMO_BREAK = 5 * 60;
const POMO_LONG = 15 * 60;

const PomoRing = ({ progress = 0 }) => {
  const r = 76;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 168 168" width="168" height="168">
      <circle cx="84" cy="84" r={r} stroke="var(--line)" strokeWidth="6" fill="none" />
      <circle
        cx="84" cy="84" r={r}
        stroke="var(--sage-deep)"
        strokeWidth="6" fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
        strokeLinecap="round"
        transform="rotate(-90 84 84)"
        style={{ transition: "stroke-dashoffset 0.6s linear" }}
      />
      <circle cx="84" cy="84" r="62" fill="var(--surface-2)" />
    </svg>
  );
};

const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const pad = (n) => String(n).padStart(2, "0");

const PomodoroCard = ({ lang, pomodoro, setPomodoro }) => {
  const [mode, setMode] = useState("work");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(POMO_WORK);
  const [session, setSession] = useState(1);

  const todayISO = T.todayISO();
  const todayCount = pomodoro.daily[todayISO] || 0;
  const total = mode === "work" ? POMO_WORK : mode === "long" ? POMO_LONG : POMO_BREAK;
  const progress = 1 - remaining / total;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // Round complete
          if (mode === "work") {
            // Increment today's count
            setPomodoro((p) => {
              const d = { ...p.daily };
              const today = T.todayISO();
              d[today] = (d[today] || 0) + 1;
              return { ...p, daily: d };
            });
            const nextCompleted = todayCount + 1;
            if (nextCompleted % 4 === 0) {
              setMode("long");
              return POMO_LONG;
            }
            setMode("break");
            return POMO_BREAK;
          } else {
            setMode("work");
            setSession((s) => Math.min(s + 1, 4));
            return POMO_WORK;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, todayCount, setPomodoro]);

  const reset = () => {
    setRunning(false);
    setRemaining(POMO_WORK);
    setMode("work");
    setSession(1);
  };
  const skip = () => setRemaining(1);

  const modeLabel = mode === "work" ? tT(lang, "In focus", "En enfoque")
                  : mode === "long" ? tT(lang, "Long break", "Descanso largo")
                  : tT(lang, "Short break", "Descanso corto");

  return (
    <div className="card col-7 card-tinted-sage" style={{ gap: 0 }}>
      <div className="card-head" style={{ marginBottom: 12 }}>
        <div>
          <div className="card-title">
            <span className="ico-bubble"><I.Timer size={13} /></span>
            {tT(lang, "Pomodoro · Deep Work", "Pomodoro · Trabajo profundo")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tT(lang,
              `Session ${session} of 4 · ${todayCount} completed today`,
              `Sesión ${session} de 4 · ${todayCount} completadas hoy`)}
          </div>
        </div>
        <button className="card-action" onClick={reset}>{tT(lang, "Reset ↺", "Reiniciar ↺")}</button>
      </div>

      <div className="pomo">
        <div className="pomo-ring">
          <PomoRing progress={progress} />
          <div className="pomo-time">
            <span className="t">{fmtTime(remaining)}</span>
            <span className="l">{tT(lang, "Remaining", "Restante")}</span>
          </div>
        </div>
        <div className="pomo-body">
          <span className="pomo-mode">
            <span className="pulse" style={{ animation: running ? "pulse 1.4s ease-in-out infinite" : "none" }} />
            {modeLabel}
          </span>
          <div className="pomo-task">
            {tT(lang, "Analyze EIS data — cycled cells batch #47", "Analizar datos EIS — celdas batch #47")}
          </div>
          <div className="pomo-task-sub">
            {tT(lang, "Linked: Tasks › Lab work › Lithium plating study", "Vinculado: Tareas › Lab › Plating de Li")}
          </div>
          <div className="pomo-actions">
            <button className="btn btn-sage" onClick={() => setRunning(!running)}>
              {running ? <I.Pause size={13} /> : <I.Play size={13} />}
              {running ? tT(lang, "Pause", "Pausar") : tT(lang, "Start", "Iniciar")}
            </button>
            <button className="btn" onClick={skip}><I.Skip size={13} /> {tT(lang, "Skip", "Saltar")}</button>
            <button className="btn" onClick={() => setRemaining(r => r + 5 * 60)}>+5 min</button>
          </div>
          <div className="pomo-segment">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={"seg" + (i < todayCount % 4 ? " done" : (i === todayCount % 4 && mode === "work") ? " active" : "")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   COUNTDOWN  — uses events from storage
   ============================================ */
const useNow = (interval = 1000) => {
  const [n, setN] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setN(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return n;
};

const CountdownCard = ({ lang, events }) => {
  const now = useNow(1000);
  // Sort events by date, pick the soonest as the main one
  const sorted = [...events].map(e => ({ ...e, when: new Date(e.dateTime) }))
    .filter(e => e.when > now - 7 * 86400000) // include events up to 1 week past
    .sort((a, b) => a.when - b.when);
  const main = sorted[0];
  const rest = sorted.slice(1, 4);

  if (!main) {
    return (
      <div className="card col-5">
        <div className="card-head"><div><div className="card-title"><span className="ico-bubble"><I.Bell size={13} /></span>{tT(lang, "Upcoming", "Próximos")}</div></div></div>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>{tT(lang, "No upcoming events.", "Sin eventos próximos.")}</div>
      </div>
    );
  }

  const diff = Math.max(0, main.when - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  const dateLabel = main.when.toLocaleDateString(lang === "ES" ? "es-ES" : "en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = main.when.toLocaleTimeString(lang === "ES" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="card col-5">
      <div className="card-head">
        <div>
          <div className="card-title">
            <span className="ico-bubble" style={{ background: "var(--sand-soft)", color: "#8a6a32" }}>
              <I.Bell size={13} />
            </span>
            {tT(lang, "Upcoming", "Próximos")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tT(lang, "Live countdown · deadlines · events", "Cuenta atrás en vivo · plazos")}
          </div>
        </div>
        <button className="card-action">{tT(lang, "All events →", "Todos →")}</button>
      </div>

      <div>
        <div className="cd-title">{main.title[lang === "ES" ? "es" : "en"]}</div>
        <div className="cd-sub">{dateLabel} · {timeLabel}{main.venue ? ` · ${main.venue}` : ""}</div>
        <div className="cd">
          <div className="cd-unit"><span className="cd-num">{pad(days)}</span><span className="cd-lab">{tT(lang, "Days", "Días")}</span></div>
          <div className="cd-unit"><span className="cd-num">{pad(hours)}</span><span className="cd-lab">{tT(lang, "Hours", "Horas")}</span></div>
          <div className="cd-unit"><span className="cd-num">{pad(mins)}</span><span className="cd-lab">Min</span></div>
          <div className="cd-unit"><span className="cd-num">{pad(secs)}</span><span className="cd-lab">Sec</span></div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        {rest.map((e) => {
          const d = Math.round((e.when - now) / 86400000);
          const lbl = d === 0 ? tT(lang, "today", "hoy") : d === 1 ? tT(lang, "tomorrow", "mañana") : tT(lang, `in ${d} d`, `en ${d} d`);
          return (
            <div key={e.id} className="kv" style={{ justifyContent: "space-between" }}>
              <span className="k">{e.title[lang === "ES" ? "es" : "en"]}</span>
              <span className="v">{lbl}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================
   TASKS  — dynamic due labels
   ============================================ */
const Task = ({ task, lang, onToggle }) => {
  const due = T.dueLabel(task.dueISO, lang);
  return (
    <div className={"todo" + (task.done ? " done" : "")}>
      <div className={"todo-check" + (task.done ? " checked" : "")} onClick={onToggle} role="button" />
      <div className="todo-text" onClick={onToggle}>
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {task.text[lang === "ES" ? "es" : "en"]}
        </span>
      </div>
      <div className="todo-meta">
        {task.priority && <span className={"tag priority-" + task.priority}>{task.priority === "high" ? "P1" : task.priority === "med" ? "P2" : "P3"}</span>}
        {due && <span className={"tag " + due.cls}>{due.text}</span>}
        <I.Drag size={14} style={{ color: "var(--muted-2)" }} />
      </div>
    </div>
  );
};

const TasksCard = ({ lang, tasks, setTasks }) => {
  const [filter, setFilter] = useState("all");
  const tabs = [
    { id: "all", en: "All", es: "Todas" },
    { id: "today", en: "Today", es: "Hoy" },
    { id: "upcoming", en: "Upcoming", es: "Próximas" },
    { id: "overdue", en: "Overdue", es: "Atrasadas" },
  ];

  const toggle = (id) => {
    setTasks((tk) => ({ ...tk, items: tk.items.map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  };

  const today = T.todayISO();
  const matchFilter = (item) => {
    if (filter === "all") return true;
    if (filter === "today") return item.dueISO === today;
    if (filter === "upcoming") return item.dueISO && item.dueISO > today;
    if (filter === "overdue") return !item.done && item.dueISO && item.dueISO < today;
    return true;
  };

  const totalDone = tasks.items.filter(i => i.done).length;
  const totalAll = tasks.items.length;

  return (
    <div className="card col-7">
      <div className="card-head">
        <div>
          <div className="card-title">
            <span className="ico-bubble"><I.Check size={13} /></span>
            {tT(lang, "Tasks", "Tareas")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tT(lang, `${totalDone} of ${totalAll} done · click to toggle`, `${totalDone} de ${totalAll} listas · toca para marcar`)}
          </div>
        </div>
        <div className="todo-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={filter === tab.id ? "active" : ""} onClick={() => setFilter(tab.id)}>
              {lang === "ES" ? tab.es : tab.en}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tasks.groups.map((grp) => {
          const groupItems = tasks.items.filter(i => i.groupId === grp.id && matchFilter(i));
          if (groupItems.length === 0) return null;
          const done = groupItems.filter(t => t.done).length;
          return (
            <React.Fragment key={grp.id}>
              <div className="todo-group">
                <span style={{ color: grp.color }}>● {grp.name[lang === "ES" ? "es" : "en"]}</span>
                <div className="grp-line" />
                <span className="count">{done} / {groupItems.length}</span>
              </div>
              {groupItems.map((task) => (
                <Task key={task.id} task={task} lang={lang} onToggle={() => toggle(task.id)} />
              ))}
            </React.Fragment>
          );
        })}
        {tasks.items.filter(matchFilter).length === 0 && (
          <div style={{ padding: "20px 0", color: "var(--muted)", fontSize: 12, textAlign: "center" }}>
            {tT(lang, "Nothing matches this filter.", "Nada coincide.")}
          </div>
        )}
      </div>

      <button className="btn" style={{ alignSelf: "flex-start" }}>
        <I.Plus size={13} /> {tT(lang, "Add task", "Añadir tarea")}
      </button>
    </div>
  );
};

/* ============================================
   HABITS — dynamic 7-day window
   ============================================ */
const computeStreak = (checks) => {
  let count = 0;
  for (let i = 0; i < 365; i++) {
    const dateISO = T.daysFromNow(-i);
    if (checks[dateISO] && checks[dateISO] > 0) count++;
    else break;
  }
  return count;
};

const HabitsCard = ({ lang, habits, setHabits }) => {
  const dates = T.last7DaysISO();
  const letters = T.last7DayLetters(lang);

  const toggle = (habitId, dateISO) => {
    setHabits((arr) => arr.map(h => {
      if (h.id !== habitId) return h;
      const cur = h.checks[dateISO] || 0;
      const next = (cur + 1) % 3; // 0 → 1 → 2 → 0
      const newChecks = { ...h.checks };
      if (next === 0) delete newChecks[dateISO];
      else newChecks[dateISO] = next;
      return { ...h, checks: newChecks };
    }));
  };

  return (
    <div className="card col-5">
      <div className="card-head">
        <div>
          <div className="card-title">
            <span className="ico-bubble" style={{ background: "#eef2e8", color: "var(--sage-deep)" }}>
              <I.Habit size={13} />
            </span>
            {tT(lang, "Habits · last 7 days", "Hábitos · últimos 7 días")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tT(lang, "Tap to log · cycles empty → half → full", "Toca para marcar")}
          </div>
        </div>
        <button className="card-action">{tT(lang, "All →", "Todos →")}</button>
      </div>

      <div>
        <div className="habit-header">
          <span>{tT(lang, "Habit", "Hábito")}</span>
          {letters.map((d, i) => <span key={i}>{d}</span>)}
        </div>
        {habits.map((h) => {
          const streak = computeStreak(h.checks);
          return (
            <div key={h.id} className="habit-row">
              <div className="habit-name">
                <span className="h-dot" style={{ background: h.color }} />
                <span className="h-label">{h.name[lang === "ES" ? "es" : "en"]}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted-2)", display: "flex", alignItems: "center", gap: 3 }}>
                  <I.Fire size={11} style={{ color: streak > 0 ? "var(--sand)" : "var(--muted-2)" }} /> {streak}d
                </span>
              </div>
              {dates.map((d, i) => {
                const val = h.checks[d] || 0;
                return (
                  <div
                    key={d}
                    className={"habit-cell " + (val === 2 ? "done" : val === 1 ? "done-soft" : "") + (i === 6 ? " today" : "")}
                    onClick={() => toggle(h.id, d)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <button className="btn" style={{ alignSelf: "flex-start" }}>
        <I.Plus size={13} /> {tT(lang, "New habit", "Nuevo hábito")}
      </button>
    </div>
  );
};

/* ============================================
   STATS — read from pomodoro.daily
   ============================================ */
const Bar = ({ h, val, day, today }) => (
  <div className="bar-col">
    <div className="bar-track">
      <div className={"bar" + (today ? " bar-today" : "") + (val === 0 ? " bar-light" : "")} style={{ height: Math.max(h, 4) + "%" }}>
        {val > 0 && <span className="bar-val">{val}</span>}
      </div>
    </div>
    <div className="bar-day">{day}</div>
  </div>
);

const StatsCard = ({ lang, pomodoro }) => {
  const [scope, setScope] = useState("week");
  const tabs = [
    { id: "week", en: "Week", es: "Semana" },
    { id: "month", en: "Month", es: "Mes" },
    { id: "all", en: "All time", es: "Total" },
  ];

  const dates = T.last7DaysISO();
  const labels = T.last7DayLabels(lang);
  const vals = dates.map(d => pomodoro.daily[d] || 0);
  const max = Math.max(8, ...vals); // floor target of 8 for sense of scale

  const weekTotal = vals.reduce((a, b) => a + b, 0);
  const allDays = Object.keys(pomodoro.daily);
  const allTotal = allDays.reduce((a, d) => a + pomodoro.daily[d], 0);
  const targetDays = vals.filter(v => v >= 4).length;
  const targetPct = Math.round(targetDays / 7 * 100);
  const totalMin = weekTotal * 25;
  const focusH = Math.floor(totalMin / 60);
  const focusM = totalMin % 60;

  return (
    <div className="card col-7">
      <div className="card-head">
        <div>
          <div className="card-title">
            <span className="ico-bubble" style={{ background: "var(--sky-soft)", color: "#3d6a7d" }}>
              <I.Stats size={13} />
            </span>
            {tT(lang, "Focus · last 7 days", "Enfoque · últimos 7 días")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tT(lang, "Real Pomodoros from your history · target 4 / day", "Pomodoros reales · meta 4 / día")}
          </div>
        </div>
        <div className="todo-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={scope === tab.id ? "active" : ""} onClick={() => setScope(tab.id)}>
              {lang === "ES" ? tab.es : tab.en}
            </button>
          ))}
        </div>
      </div>

      <div className="bars">
        {vals.map((v, i) => (
          <Bar key={i} h={(v / max) * 100} val={v} day={labels[i]} today={i === 6} />
        ))}
      </div>

      <div className="stat-row">
        <div className="stat-cell">
          <div className="v">{weekTotal}</div>
          <div className="l">{tT(lang, "This week", "Esta semana")}</div>
        </div>
        <div className="stat-cell">
          <div className="v">{focusH}h {focusM}m</div>
          <div className="l">{tT(lang, "Total focus time", "Tiempo total")}</div>
        </div>
        <div className="stat-cell">
          <div className="v">{targetPct}%</div>
          <div className="l">{tT(lang, "Days hit target", "Días con meta")}</div>
        </div>
      </div>

      {scope === "all" && (
        <div className="kv" style={{ justifyContent: "center", paddingTop: 6 }}>
          <span className="k">{tT(lang, "All-time Pomodoros logged", "Pomodoros totales")}:</span>
          <span className="v">{allTotal}</span>
        </div>
      )}
    </div>
  );
};

/* ============================================
   NOTES — dynamic dates
   ============================================ */
const NotesCard = ({ lang, notes }) => {
  const [hover, setHover] = useState(null);
  const tagStyle = (c) => {
    if (c === "sage") return { background: "var(--sage-soft)", color: "var(--sage-deep)" };
    if (c === "sky") return { background: "var(--sky-soft)", color: "#3d6a7d" };
    if (c === "rust") return { background: "#f4dcd1", color: "#8a4a32" };
    return {};
  };
  return (
    <div className="card col-5">
      <div className="card-head">
        <div>
          <div className="card-title">
            <span className="ico-bubble" style={{ background: "#f3eee2", color: "#7a5a32" }}>
              <I.Note size={13} />
            </span>
            {tT(lang, "Recent notes", "Notas recientes")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tT(lang, `Markdown · ${notes.length} notes · stored locally`, `Markdown · ${notes.length} notas · locales`)}
          </div>
        </div>
        <button className="card-action"><I.Plus size={12} /> {tT(lang, "New", "Nueva")}</button>
      </div>

      <div className="note-grid">
        {notes.map((n) => (
          <div
            key={n.id}
            className="note-card"
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer", transform: hover === n.id ? "translateY(-2px)" : "none", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: hover === n.id ? "var(--shadow-md)" : "none" }}
          >
            <div className="note-title">
              {n.pinned && <I.Pin size={11} style={{ color: "var(--sand)", marginRight: 4, verticalAlign: "middle" }} />}
              {n.title[lang === "ES" ? "es" : "en"]}
            </div>
            <div className="note-snippet">{n.snippet[lang === "ES" ? "es" : "en"]}</div>
            <div className="note-foot">
              <span className="tag" style={tagStyle(n.tagColor)}>{n.tag}</span>
              <span className="note-date" style={{ marginLeft: "auto" }}>{T.relativePast(n.updatedISO, lang)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.cardsTimers = { PomodoroCard, CountdownCard };
window.cardsTasks = { TasksCard, HabitsCard };
window.cardsInsight = { StatsCard, NotesCard };
