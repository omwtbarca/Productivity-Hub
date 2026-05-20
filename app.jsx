/* ============================================
   App root — routing + modals + persistence
   ============================================ */
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;
const useStorage = PHub.useStorage;

/* ----- Data menu (export / reset) ----- */
const DataMenu = ({ open, onClose, lang }) => {
  const fileInputRef = useRefApp(null);
  if (!open) return null;
  const t = (en, es) => (lang === "ES" ? es : en);

  const onExport = () => {
    const data = PHub.Storage.exportAll();
    const stamp = new Date().toISOString().slice(0, 10);
    PHub.downloadJSON(data, `productivity-hub-backup-${stamp}.json`);
  };
  const onImportClick = () => fileInputRef.current && fileInputRef.current.click();
  const onImportChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (PHub.Storage.importAll(data)) { alert(t("Backup imported. Reloading…", "Copia importada. Recargando…")); location.reload(); }
        else { alert(t("Import failed.", "Importación fallida.")); }
      } catch (err) { alert(t("Invalid JSON file.", "JSON inválido.")); }
    };
    r.readAsText(file);
  };
  const onReset = () => {
    if (confirm(t("Delete ALL local data? This cannot be undone. Tip: export a backup first.", "¿Borrar TODOS los datos locales? No se puede deshacer."))) {
      PHub.Storage.resetAll();
      location.reload();
    }
  };

  return (
    <>
      <div className="datamenu-backdrop" onClick={onClose} />
      <div className="datamenu" role="dialog" aria-modal="true">
        <div className="datamenu-head">
          <div className="datamenu-title">{t("Your data", "Tus datos")}</div>
          <button className="icon-btn" onClick={onClose} title={t("Close", "Cerrar")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <p className="datamenu-body">
          {t("Everything you do here (tasks, habits, Pomodoros, flashcard progress, notes) is stored only in your browser via localStorage. Nothing is sent to any server. Clearing your browser data wipes it.",
             "Todo lo que haces aquí se guarda solo en tu navegador con localStorage. Nada se envía a ningún servidor.")}
        </p>
        <div className="datamenu-actions">
          <button className="btn btn-primary" onClick={onExport}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 20h14" /></svg>
            {t("Export backup (.json)", "Exportar copia")}
          </button>
          <button className="btn" onClick={onImportClick}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V9M7 14l5-5 5 5M5 4h14" /></svg>
            {t("Import backup", "Importar copia")}
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={onImportChange} />
          <button className="btn btn-danger" onClick={onReset}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
            {t("Reset all data", "Borrar todo")}
          </button>
        </div>
      </div>
    </>
  );
};

/* ----- Page-title helper ----- */
const VIEW_TITLES = {
  Dashboard: { en: "Dashboard", es: "Panel" },
  Timers: { en: "Timers", es: "Temporizadores" },
  Tasks: { en: "Tasks", es: "Tareas" },
  Habits: { en: "Habits", es: "Hábitos" },
  Notes: { en: "Notes", es: "Notas" },
  Flashcards: { en: "Flashcards", es: "Tarjetas" },
  Stats: { en: "Focus Stats", es: "Estadísticas" },
  Sounds: { en: "Ambient Sounds", es: "Sonidos" },
  Papers: { en: "Paper Queue", es: "Lecturas" },
};
const VIEW_SUBS = {
  Dashboard: { en: "Everything at a glance", es: "Todo en una vista" },
  Timers: { en: "Pomodoro + live countdown to events", es: "Pomodoro + cuenta atrás en vivo" },
  Tasks: { en: "Grouped by project · click to toggle · drag tags to retag", es: "Agrupadas por proyecto" },
  Habits: { en: "Rolling 7-day heatmap · click to log", es: "Mapa rodante de 7 días" },
  Notes: { en: "Markdown · click any note to edit", es: "Markdown · clic para editar" },
  Flashcards: { en: "Spaced repetition · 3 decks", es: "Repetición espaciada · 3 mazos" },
  Stats: { en: "Pomodoro history from your real sessions", es: "Historial real de Pomodoros" },
  Sounds: { en: "Procedural ambient — no audio files", es: "Ambiente procedural" },
  Papers: { en: "Reading queue · click +10% per session", es: "Cola de lectura · +10% por sesión" },
};

const App = () => {
  const [settings, setSettings] = useStorage("settings", { lang: "EN", dark: false });
  const lang = settings.lang;
  const dark = settings.dark;
  const setLang = (l) => setSettings((s) => ({ ...s, lang: l }));
  const setDark = (d) => setSettings((s) => ({ ...s, dark: typeof d === "function" ? d(s.dark) : d }));

  const [tasks, setTasks] = useStorage("tasks", PHub.seeds.tasks);
  const [habits, setHabits] = useStorage("habits", PHub.seeds.habits);
  const [pomodoro, setPomodoro] = useStorage("pomodoro", PHub.seeds.pomodoro);
  const [flashcards, setFlashcards] = useStorage("flashcards", PHub.seeds.flashcards);
  const [papers, setPapers] = useStorage("papers", PHub.seeds.papers);
  const [events, setEvents] = useStorage("events", PHub.seeds.events);
  const [notes, setNotes] = useStorage("notes", PHub.seeds.notes);

  const [active, setActive] = useStateApp("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useStateApp(false);
  const [dataMenuOpen, setDataMenuOpen] = useStateApp(false);

  // Modal state
  const [taskModalOpen, setTaskModalOpen] = useStateApp(false);
  const [editingTask, setEditingTask] = useStateApp(null);
  const [habitModalOpen, setHabitModalOpen] = useStateApp(false);
  const [noteModalOpen, setNoteModalOpen] = useStateApp(false);
  const [editingNote, setEditingNote] = useStateApp(null);
  const [eventModalOpen, setEventModalOpen] = useStateApp(false);

  useEffectApp(() => { document.body.classList.toggle("dark", dark); }, [dark]);
  useEffectApp(() => {
    const onKey = (e) => { if (e.key === "Escape") { setSidebarOpen(false); setDataMenuOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffectApp(() => {
    const cleanup = () => { if (window.ambientPlayer) window.ambientPlayer.stop(); };
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

  // Scroll to top when changing views
  useEffectApp(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [active]);

  const { PomodoroCard, CountdownCard } = window.cardsTimers;
  const { TasksCard, HabitsCard } = window.cardsTasks;
  const { StatsCard, NotesCard } = window.cardsInsight;
  const { FlashcardCard, SoundsCard, PapersCard } = window.cardsLearn;
  const { AddTaskModal, AddHabitModal, NoteEditorModal, AddEventModal } = window.modals;

  // Common card props builders
  const tasksProps = { lang, tasks, setTasks, onAdd: () => { setEditingTask(null); setTaskModalOpen(true); }, onEdit: (t) => { setEditingTask(t); setTaskModalOpen(true); } };
  const habitsProps = { lang, habits, setHabits, onAdd: () => setHabitModalOpen(true) };
  const notesProps = { lang, notes, onAdd: () => { setEditingNote(null); setNoteModalOpen(true); }, onEdit: (n) => { setEditingNote(n); setNoteModalOpen(true); } };
  const pomodoroProps = { lang, pomodoro, setPomodoro, tasks };
  const countdownProps = { lang, events, setEvents, onAdd: () => setEventModalOpen(true) };
  const statsProps = { lang, pomodoro };
  const flashcardsProps = { lang, flashcards, setFlashcards };
  const soundsProps = { lang };
  const papersProps = { lang, papers, setPapers };

  /* ----- View renderer ----- */
  const renderView = () => {
    if (active === "Dashboard") {
      return (
        <section className="content" data-screen-label="01 Dashboard">
          <PomodoroCard {...pomodoroProps} />
          <CountdownCard {...countdownProps} />
          <TasksCard {...tasksProps} />
          <HabitsCard {...habitsProps} />
          <StatsCard {...statsProps} />
          <NotesCard {...notesProps} />
          <FlashcardCard {...flashcardsProps} />
          <SoundsCard {...soundsProps} />
          <PapersCard {...papersProps} />
        </section>
      );
    }
    // Single-module views
    const viewTitle = PHub.localize(VIEW_TITLES[active], lang);
    const viewSub = PHub.localize(VIEW_SUBS[active], lang);
    return (
      <section className="content single-view" data-screen-label={"02 " + active}>
        <div className="view-head" style={{ gridColumn: "1 / -1" }}>
          <div>
            <div className="view-title">{viewTitle}</div>
            <div className="view-sub">{viewSub}</div>
          </div>
        </div>
        {active === "Timers" && (
          <>
            <PomodoroCard {...pomodoroProps} fullWidth />
            <CountdownCard {...countdownProps} fullWidth />
          </>
        )}
        {active === "Tasks" && <TasksCard {...tasksProps} fullWidth />}
        {active === "Habits" && <HabitsCard {...habitsProps} fullWidth />}
        {active === "Notes" && <NotesCard {...notesProps} fullWidth />}
        {active === "Flashcards" && <FlashcardCard {...flashcardsProps} fullWidth />}
        {active === "Stats" && <StatsCard {...statsProps} fullWidth />}
        {active === "Sounds" && <SoundsCard {...soundsProps} fullWidth />}
        {active === "Papers" && <PapersCard {...papersProps} fullWidth />}
      </section>
    );
  };

  return (
    <div className="app">
      <Sidebar
        active={active} setActive={setActive} lang={lang}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        onDataClick={() => { setSidebarOpen(false); setDataMenuOpen(true); }}
      />
      <div className={"sidebar-backdrop" + (sidebarOpen ? " show" : "")} onClick={() => setSidebarOpen(false)} />
      <main className="main">
        <Topbar
          lang={lang} setLang={setLang} dark={dark} setDark={setDark}
          onMenuClick={() => setSidebarOpen(true)}
          onDataClick={() => setDataMenuOpen(true)}
        />
        {renderView()}
      </main>

      <DataMenu open={dataMenuOpen} onClose={() => setDataMenuOpen(false)} lang={lang} />
      <AddTaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} lang={lang} tasks={tasks} setTasks={setTasks} editing={editingTask} />
      <AddHabitModal open={habitModalOpen} onClose={() => setHabitModalOpen(false)} lang={lang} habits={habits} setHabits={setHabits} />
      <NoteEditorModal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} lang={lang} notes={notes} setNotes={setNotes} editing={editingNote} />
      <AddEventModal open={eventModalOpen} onClose={() => setEventModalOpen(false)} lang={lang} events={events} setEvents={setEvents} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
