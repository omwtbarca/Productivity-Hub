/* ============================================
   App root  —  state lifted, persisted via useStorage
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
        if (PHub.Storage.importAll(data)) {
          alert(t("Backup imported. Reloading…", "Copia importada. Recargando…"));
          location.reload();
        } else { alert(t("Import failed.", "Importación fallida.")); }
      } catch (err) { alert(t("Invalid JSON file.", "JSON inválido.")); }
    };
    r.readAsText(file);
  };

  const onReset = () => {
    if (confirm(t(
      "Delete ALL local data? This cannot be undone. Tip: export a backup first.",
      "¿Borrar TODOS los datos locales? No se puede deshacer. Consejo: exporta primero."
    ))) {
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
          {t(
            "Everything you do here (tasks, habits, Pomodoros, flashcard progress, notes) is stored only in your browser via localStorage. Nothing is sent to any server. Clearing your browser data wipes it.",
            "Todo lo que haces aquí (tareas, hábitos, Pomodoros, tarjetas, notas) se guarda solo en tu navegador con localStorage. Nada se envía a ningún servidor. Borrar los datos del navegador lo elimina."
          )}
        </p>
        <div className="datamenu-actions">
          <button className="btn btn-primary" onClick={onExport}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M5 20h14" />
            </svg>
            {t("Export backup (.json)", "Exportar copia (.json)")}
          </button>
          <button className="btn" onClick={onImportClick}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21V9M7 14l5-5 5 5M5 4h14" />
            </svg>
            {t("Import backup", "Importar copia")}
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={onImportChange} />
          <button className="btn btn-danger" onClick={onReset}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
            </svg>
            {t("Reset all data", "Borrar todo")}
          </button>
        </div>
      </div>
    </>
  );
};

const App = () => {
  // Settings
  const [settings, setSettings] = useStorage("settings", { lang: "EN", dark: false });
  const lang = settings.lang;
  const dark = settings.dark;
  const setLang = (l) => setSettings((s) => ({ ...s, lang: l }));
  const setDark = (d) => setSettings((s) => ({ ...s, dark: typeof d === "function" ? d(s.dark) : d }));

  // Persisted state slices
  const [tasks, setTasks] = useStorage("tasks", PHub.seeds.tasks);
  const [habits, setHabits] = useStorage("habits", PHub.seeds.habits);
  const [pomodoro, setPomodoro] = useStorage("pomodoro", PHub.seeds.pomodoro);
  const [flashcards, setFlashcards] = useStorage("flashcards", PHub.seeds.flashcards);
  const [papers, setPapers] = useStorage("papers", PHub.seeds.papers);
  const [events, setEvents] = useStorage("events", PHub.seeds.events);
  const [notes, setNotes] = useStorage("notes", PHub.seeds.notes);

  // UI state (not persisted)
  const [active, setActive] = useStateApp("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useStateApp(false);
  const [dataMenuOpen, setDataMenuOpen] = useStateApp(false);

  useEffectApp(() => { document.body.classList.toggle("dark", dark); }, [dark]);

  useEffectApp(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setDataMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffectApp(() => {
    const cleanup = () => { if (window.ambientPlayer) window.ambientPlayer.stop(); };
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

  const { PomodoroCard, CountdownCard } = window.cardsTimers;
  const { TasksCard, HabitsCard } = window.cardsTasks;
  const { StatsCard, NotesCard } = window.cardsInsight;
  const { FlashcardCard, SoundsCard, PapersCard } = window.cardsLearn;

  return (
    <div className="app">
      <Sidebar
        active={active}
        setActive={setActive}
        lang={lang}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onDataClick={() => { setSidebarOpen(false); setDataMenuOpen(true); }}
      />
      <div className={"sidebar-backdrop" + (sidebarOpen ? " show" : "")} onClick={() => setSidebarOpen(false)} />
      <main className="main">
        <Topbar
          lang={lang} setLang={setLang}
          dark={dark} setDark={setDark}
          onMenuClick={() => setSidebarOpen(true)}
          onDataClick={() => setDataMenuOpen(true)}
        />
        <section className="content" data-screen-label="01 Dashboard">
          <PomodoroCard lang={lang} pomodoro={pomodoro} setPomodoro={setPomodoro} />
          <CountdownCard lang={lang} events={events} />
          <TasksCard lang={lang} tasks={tasks} setTasks={setTasks} />
          <HabitsCard lang={lang} habits={habits} setHabits={setHabits} />
          <StatsCard lang={lang} pomodoro={pomodoro} />
          <FlashcardCard lang={lang} flashcards={flashcards} setFlashcards={setFlashcards} />
          <SoundsCard lang={lang} />
          <NotesCard lang={lang} notes={notes} />
          <PapersCard lang={lang} papers={papers} setPapers={setPapers} />
        </section>
      </main>
      <DataMenu open={dataMenuOpen} onClose={() => setDataMenuOpen(false)} lang={lang} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
