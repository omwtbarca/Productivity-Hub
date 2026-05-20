/* ============================================
   Sidebar + Topbar
   ============================================ */

const { useState: useStateShell, useEffect: useEffectShell } = React;

const SidebarItem = ({ icon: Ic, label, active, badge, onClick }) => (
  <button className={"nav-item" + (active ? " active" : "")} onClick={onClick}>
    <Ic className="icon" />
    <span>{label}</span>
    {badge && <span className="badge">{badge}</span>}
  </button>
);

const Sidebar = ({ active, setActive, lang, open, onClose, onDataClick }) => {
  const t = (en, es) => (lang === "ES" ? es : en);
  const handleNav = (key) => {
    setActive(key);
    if (onClose) onClose();
  };
  return (
    <aside className={"sidebar" + (open ? " open" : "")}>
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <div className="brand-name">Productivity Hub</div>
          <div className="brand-sub">{t("Focus · Learn · Grow", "Enfoque · Aprende · Crece")}</div>
        </div>
      </div>

      <SidebarItem icon={I.Home} label={t("Dashboard", "Panel")} active={active === "Dashboard"} onClick={() => handleNav("Dashboard")} />
      <SidebarItem icon={I.Timer} label={t("Timers", "Temporizadores")} active={active === "Timers"} badge="2" onClick={() => handleNav("Timers")} />
      <SidebarItem icon={I.Check} label={t("Tasks", "Tareas")} active={active === "Tasks"} badge="7" onClick={() => handleNav("Tasks")} />
      <SidebarItem icon={I.Habit} label={t("Habits", "Hábitos")} active={active === "Habits"} onClick={() => handleNav("Habits")} />
      <SidebarItem icon={I.Note} label={t("Notes", "Notas")} active={active === "Notes"} badge="12" onClick={() => handleNav("Notes")} />
      <SidebarItem icon={I.Card} label={t("Flashcards", "Tarjetas")} active={active === "Flashcards"} onClick={() => handleNav("Flashcards")} />

      <div className="nav-group-label">{t("Insights", "Análisis")}</div>
      <SidebarItem icon={I.Stats} label={t("Focus Stats", "Estadísticas")} active={active === "Stats"} onClick={() => handleNav("Stats")} />
      <SidebarItem icon={I.Wave} label={t("Sounds", "Sonidos")} active={active === "Sounds"} onClick={() => handleNav("Sounds")} />

      <div className="nav-group-label">{t("Research", "Investigación")}</div>
      <SidebarItem icon={I.Leaf} label={t("Paper Queue", "Lecturas")} active={active === "Papers"} badge="5" onClick={() => handleNav("Papers")} />

      <div className="sidebar-foot">
        <div className="avatar">EZ</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="user-name">Ezra</div>
          <div className="user-role">PhD · Li-metal anode</div>
        </div>
        <button className="icon-btn" onClick={onDataClick} title={t("Your data", "Tus datos")} style={{ flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="6" rx="8" ry="3" />
            <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
            <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

/* ----- Weather (Open-Meteo, free, no key) ----- */
// 西安市长安区 ≈ 34.16°N, 108.93°E
const XIAN_LAT = 34.16;
const XIAN_LON = 108.93;

const wmoMap = {
  0:  { en: "Clear", es: "Despejado", icon: "Sun" },
  1:  { en: "Mainly clear", es: "Mayormente despejado", icon: "Sun" },
  2:  { en: "Partly cloudy", es: "Parcialmente nublado", icon: "Cloud" },
  3:  { en: "Overcast", es: "Nublado", icon: "Cloud" },
  45: { en: "Fog", es: "Niebla", icon: "Cloud" },
  48: { en: "Rime fog", es: "Niebla helada", icon: "Cloud" },
  51: { en: "Light drizzle", es: "Llovizna leve", icon: "Rain" },
  53: { en: "Drizzle", es: "Llovizna", icon: "Rain" },
  55: { en: "Heavy drizzle", es: "Llovizna fuerte", icon: "Rain" },
  56: { en: "Freezing drizzle", es: "Llovizna helada", icon: "Rain" },
  57: { en: "Freezing drizzle", es: "Llovizna helada", icon: "Rain" },
  61: { en: "Light rain", es: "Lluvia leve", icon: "Rain" },
  63: { en: "Rain", es: "Lluvia", icon: "Rain" },
  65: { en: "Heavy rain", es: "Lluvia fuerte", icon: "Rain" },
  66: { en: "Freezing rain", es: "Lluvia helada", icon: "Rain" },
  67: { en: "Freezing rain", es: "Lluvia helada", icon: "Rain" },
  71: { en: "Light snow", es: "Nieve leve", icon: "Snow" },
  73: { en: "Snow", es: "Nieve", icon: "Snow" },
  75: { en: "Heavy snow", es: "Nieve fuerte", icon: "Snow" },
  77: { en: "Snow grains", es: "Gránulos de nieve", icon: "Snow" },
  80: { en: "Showers", es: "Chubascos", icon: "Rain" },
  81: { en: "Showers", es: "Chubascos", icon: "Rain" },
  82: { en: "Heavy showers", es: "Chubascos fuertes", icon: "Rain" },
  85: { en: "Snow showers", es: "Chubascos de nieve", icon: "Snow" },
  86: { en: "Snow showers", es: "Chubascos de nieve", icon: "Snow" },
  95: { en: "Thunderstorm", es: "Tormenta", icon: "Cloud" },
  96: { en: "Thunderstorm", es: "Tormenta", icon: "Cloud" },
  99: { en: "Thunderstorm", es: "Tormenta", icon: "Cloud" },
};

const WeatherIcon = ({ kind, size = 14 }) => {
  if (kind === "Rain") return <I.Rain size={size} />;
  if (kind === "Cloud") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18a4 4 0 0 1 .8-7.9A6 6 0 0 1 18 11a4 4 0 0 1 .8 7.9z" />
    </svg>
  );
  if (kind === "Snow") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19" />
    </svg>
  );
  return <I.Sun size={size} />;
};

const useWeather = () => {
  const [w, setW] = useStateShell({ loading: true, temp: null, code: null });
  useEffectShell(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${XIAN_LAT}&longitude=${XIAN_LON}&current=temperature_2m,weather_code&timezone=Asia%2FShanghai`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.current) {
          setW({ loading: false, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code });
        } else {
          setW({ loading: false, temp: null, code: null, error: true });
        }
      })
      .catch(() => setW({ loading: false, temp: null, code: null, error: true }));
  }, []);
  return w;
};

const Topbar = ({ lang, setLang, dark, setDark, onMenuClick, onDataClick }) => {
  const t = (en, es) => (lang === "ES" ? es : en);
  const w = useWeather();
  const wInfo = (w.code != null && wmoMap[w.code]) || null;

  const now = new Date();
  const dayName = now.toLocaleDateString(lang === "ES" ? "es-ES" : "en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString(lang === "ES" ? "es-ES" : "en-US", { month: "short", day: "numeric", year: "numeric" });
  const weekNum = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);

  const hour = now.getHours();
  const greet = hour < 5 ? t("Late night", "Buenas noches") :
                hour < 12 ? t("Good morning", "Buenos días") :
                hour < 18 ? t("Good afternoon", "Buenas tardes") :
                t("Good evening", "Buenas noches");
  const greetIcon = hour >= 6 && hour < 19 ? "☀" : "☾";

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenuClick} title={t("Menu", "Menú")} aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div className="greet">
        <div className="greet-line">
          {greet}, Ezra {greetIcon}
        </div>
        <div className="greet-meta">
          <span style={{ textTransform: "capitalize" }}>{dayName} · {dateStr}</span>
          <span className="dot" />
          <span>{t("Week", "Semana")} {weekNum}</span>
          <span className="dot" />
          <span>{t("Xi'an · Chang'an", "Xi'an · Chang'an")}</span>
        </div>
      </div>

      <div className="topbar-spacer" />

      <div className={"weather" + (w.loading ? " loading" : "")} title={t("Live · Open-Meteo", "En vivo · Open-Meteo")}>
        {w.loading || !wInfo ? (
          <>
            <I.Sun size={14} />
            <span className="cond">{w.loading ? t("Loading…", "Cargando…") : t("Weather unavailable", "Sin datos")}</span>
          </>
        ) : (
          <>
            <WeatherIcon kind={wInfo.icon} />
            <span className="temp">{w.temp}°</span>
            <span className="cond">{lang === "ES" ? wInfo.es : wInfo.en}</span>
          </>
        )}
      </div>

      <div className="search" style={{ cursor: "text", opacity: 0.7 }}>
        <I.Search size={14} />
        <span>{t("Search anything", "Buscar")}</span>
        <kbd>⌘K</kbd>
      </div>

      <div className="lang-switch">
        <button className={lang === "EN" ? "active" : ""} onClick={() => setLang("EN")}>EN</button>
        <button className={lang === "ES" ? "active" : ""} onClick={() => setLang("ES")}>ES</button>
      </div>

      <button className="icon-btn" title={t("Toggle dark mode", "Cambiar tema")} onClick={() => setDark(!dark)}>
        {dark ? <I.Sun size={16} /> : <I.Moon size={16} />}
      </button>
      <button className="icon-btn" title={t("Your data", "Tus datos")} onClick={onDataClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
          <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
        </svg>
      </button>
    </header>
  );
};

window.Sidebar = Sidebar;
window.Topbar = Topbar;
