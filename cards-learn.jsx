/* ============================================
   Flashcards + Sounds + Papers (persisted)
   ============================================ */

const { useState: useStateB, useEffect: useEffectB, useRef: useRefB } = React;
const tB = (lang, en, es) => (lang === "ES" ? es : en);
const Tm = PHub.Time;

/* ============================================
   FLASHCARDS
   ============================================ */
const DECKS = {
  spanishA2: {
    icon: "🇪🇸",
    name: { en: "Spanish · A2 vocab", es: "Español · A2 vocab" },
    accent: "var(--sage)",
    cards: [
      { word: "aprovechar", phon: "/a.pɾo.beˈt͡ʃaɾ/", tag: { en: "A2 · verb", es: "A2 · verbo" }, back: { en: "to take advantage of, to make the most of", es: "aprovecharse de algo" }, example: { en: "Aprovechemos el buen tiempo.", es: "Aprovechemos el buen tiempo." } },
      { word: "alcanzar", phon: "/al.kanˈθaɾ/", tag: { en: "A2 · verb", es: "A2 · verbo" }, back: { en: "to reach, to achieve", es: "lograr, llegar a" }, example: { en: "Alcanzó su meta.", es: "Alcanzó su meta." } },
      { word: "el plazo", phon: "/el ˈpla.θo/", tag: { en: "A2 · noun", es: "A2 · sustantivo" }, back: { en: "deadline, time period", es: "fecha límite" }, example: { en: "El plazo termina mañana.", es: "El plazo termina mañana." } },
      { word: "imprescindible", phon: "/im.pɾes.θinˈdi.βle/", tag: { en: "B1 · adj", es: "B1 · adjetivo" }, back: { en: "essential, indispensable", es: "absolutamente necesario" }, example: { en: "Es imprescindible.", es: "Es imprescindible." } },
      { word: "el ensayo", phon: "/el enˈsa.ʝo/", tag: { en: "B1 · noun", es: "B1 · sustantivo" }, back: { en: "essay; trial / experiment", es: "prueba, experimento" }, example: { en: "Un ensayo controlado.", es: "Un ensayo controlado." } },
      { word: "averiguar", phon: "/a.βe.ɾiˈɣwaɾ/", tag: { en: "B1 · verb", es: "B1 · verbo" }, back: { en: "to find out, to ascertain", es: "descubrir, comprobar" }, example: { en: "Voy a averiguarlo.", es: "Voy a averiguarlo." } },
    ],
  },
  subjuntivo: {
    icon: "🇪🇸",
    name: { en: "Subjuntivo phrases", es: "Frases subjuntivo" },
    accent: "var(--sand)",
    cards: [
      { word: "Ojalá que…", phon: "+ subjuntivo", tag: { en: "expression", es: "expresión" }, back: { en: "I hope that… (uncertainty)", es: "Espero que… (incertidumbre)" }, example: { en: "Ojalá que llueva.", es: "Ojalá que llueva." } },
      { word: "Es necesario que…", phon: "+ subjuntivo", tag: { en: "impersonal", es: "impersonal" }, back: { en: "It's necessary that…", es: "Hace falta que…" }, example: { en: "Es necesario que estudies.", es: "Es necesario que estudies." } },
      { word: "Aunque sea…", phon: "+ subjuntivo", tag: { en: "concession", es: "concesión" }, back: { en: "Even if / even though…", es: "Aun cuando…" }, example: { en: "Aunque sea difícil.", es: "Aunque sea difícil." } },
    ],
  },
  battery: {
    icon: "🔋",
    name: { en: "Battery terminology", es: "Términos de batería" },
    accent: "var(--sky)",
    cards: [
      { word: "Coulombic efficiency", phon: "CE", tag: { en: "metric", es: "métrica" }, back: { en: "Ratio of discharge to charge capacity per cycle. CE → 1 means reversible plating.", es: "Razón capacidad descarga / carga por ciclo." }, example: { en: "CE > 99.5% needed for anode-free.", es: "CE > 99.5% para anode-free." } },
      { word: "SEI", phon: "Solid Electrolyte Interphase", tag: { en: "layer", es: "capa" }, back: { en: "Passivating layer on Li anode formed during cycling. Composition controls dendrite suppression.", es: "Capa pasivante en el ánodo de Li." }, example: { en: "F-rich SEI from LiFSI.", es: "SEI rico en F de LiFSI." } },
      { word: "Dendrite", phon: "tree-like Li deposit", tag: { en: "morphology", es: "morfología" }, back: { en: "Needle-like Li growth that can short-circuit the cell.", es: "Crecimiento de Li tipo aguja que puede causar cortocircuito." }, example: { en: "Dendrites cause cell failure.", es: "Las dendritas causan fallo de celda." } },
    ],
  },
};

const SRS_LABELS = {
  again: { en: "<1m", es: "<1m" },
  hard: { en: "6m", es: "6m" },
  good: { en: "1d", es: "1d" },
  easy: { en: "4d", es: "4d" },
};

const FlashcardCard = ({ lang, flashcards, setFlashcards }) => {
  const [deckId, setDeckId] = useStateB("spanishA2");
  const [idx, setIdx] = useStateB(0);
  const [revealed, setRevealed] = useStateB(false);

  const todayISO = Tm.todayISO();
  const todayDone = flashcards.doneToday[todayISO] || 0;
  const deck = DECKS[deckId];
  const card = deck.cards[idx % deck.cards.length];

  const rate = (level) => {
    setFlashcards((fc) => ({
      ...fc,
      doneToday: { ...fc.doneToday, [todayISO]: (fc.doneToday[todayISO] || 0) + 1 }
    }));
    setRevealed(false);
    setIdx((i) => (i + 1) % deck.cards.length);
  };

  const totalDue = 14;

  return (
    <div className="card col-4">
      <div className="card-head">
        <div>
          <div className="card-title">
            <span className="ico-bubble" style={{ background: "#f4dcd1", color: "#8a4a32" }}>
              <I.Card size={13} />
            </span>
            {tB(lang, "Flashcards · SRS", "Tarjetas · SRS")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tB(lang, `${Math.max(0, totalDue - todayDone)} cards due · 3 decks`, `${Math.max(0, totalDue - todayDone)} pendientes · 3 mazos`)}
          </div>
        </div>
        <button className="card-action" onClick={() => {
          setFlashcards((fc) => ({ ...fc, doneToday: { ...fc.doneToday, [todayISO]: 0 } }));
          setRevealed(false); setIdx(0);
        }}>
          {tB(lang, "Reset today", "Reiniciar hoy")}
        </button>
      </div>

      <div className="fc" style={{ cursor: revealed ? "default" : "pointer" }} onClick={() => !revealed && setRevealed(true)}>
        <div>
          <div className="fc-tag">{card.tag[lang === "ES" ? "es" : "en"]} · {deck.name[lang === "ES" ? "es" : "en"]}</div>
          {!revealed ? (
            <>
              <div className="fc-word" style={{ marginTop: 18 }}>{card.word}</div>
              <div className="fc-phon">{card.phon}</div>
            </>
          ) : (
            <>
              <div className="fc-word" style={{ marginTop: 14, fontSize: 22 }}>
                {card.back[lang === "ES" ? "es" : "en"]}
              </div>
              <div className="fc-phon" style={{ marginTop: 8, fontStyle: "italic", fontFamily: "var(--font-sans)" }}>
                "{card.example[lang === "ES" ? "es" : "en"]}"
              </div>
            </>
          )}
        </div>
        <div className="fc-foot">
          <span className="fc-progress">{todayDone} / {totalDue} {tB(lang, "today", "hoy")}</span>
          {!revealed && (
            <button className="btn" style={{ background: "rgba(255,255,255,0.6)" }} onClick={(e) => { e.stopPropagation(); setRevealed(true); }}>
              {tB(lang, "Reveal →", "Revelar →")}
            </button>
          )}
        </div>
      </div>

      {revealed ? (
        <div className="fc-rating-grid" style={{ display: "flex", gap: 6 }}>
          <button className="btn" style={{ flex: 1, justifyContent: "center", background: "#f4dcd1", borderColor: "#ebc7b3", color: "#8a4a32" }} onClick={() => rate("again")}>
            {tB(lang, "Again", "Otra")} · {SRS_LABELS.again.en}
          </button>
          <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => rate("hard")}>
            {tB(lang, "Hard", "Difícil")} · {SRS_LABELS.hard.en}
          </button>
          <button className="btn" style={{ flex: 1, justifyContent: "center", background: "var(--sage-soft)", borderColor: "transparent", color: "var(--sage-deep)" }} onClick={() => rate("good")}>
            {tB(lang, "Good", "Bien")} · {SRS_LABELS.good.en}
          </button>
          <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => rate("easy")}>
            {tB(lang, "Easy", "Fácil")} · {SRS_LABELS.easy.en}
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          {tB(lang, "Click card or press Reveal to see meaning", "Toca la tarjeta o pulsa Revelar")}
        </div>
      )}

      <div className="divider-text"><span className="l" /> <span>{tB(lang, "YOUR DECKS", "TUS MAZOS")}</span> <span className="l" /></div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(DECKS).map(([id, d]) => (
          <div key={id} onClick={() => { setDeckId(id); setIdx(0); setRevealed(false); }} style={{ cursor: "pointer" }}>
            <div className="kv" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: deckId === id ? "var(--sage-deep)" : "var(--ink-soft)", fontSize: 12.5, fontWeight: deckId === id ? 500 : 400 }}>
                {d.icon} {d.name[lang === "ES" ? "es" : "en"]}
              </span>
              <span className="v">{d.cards.length} {tB(lang, "cards", "tarjetas")}</span>
            </div>
            <div className="pmini" style={{ marginTop: 4 }}>
              <div style={{ width: (deckId === id ? Math.min(100, (idx / d.cards.length) * 100) : 0) + "%", background: d.accent }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================
   SOUNDS  — Web Audio (no persistence)
   ============================================ */
const SOUND_PRESETS = [
  { id: "ocean", icon: "Wave", name: { en: "Ocean waves", es: "Olas del mar" } },
  { id: "rain", icon: "Rain", name: { en: "Rain · leaves", es: "Lluvia · hojas" } },
  { id: "cafe", icon: "Cafe", name: { en: "Café · soft", es: "Café · suave" } },
  { id: "fire", icon: "Fire", name: { en: "Fireplace", es: "Chimenea" } },
  { id: "forest", icon: "Leaf", name: { en: "Forest dawn", es: "Bosque al alba" } },
  { id: "brown", icon: "Wave", name: { en: "Brown noise", es: "Ruido marrón" } },
];

const SoundsCard = ({ lang }) => {
  const [active, setActive] = useStateB(null);
  const [volume, setVolume] = useStateB(0.6);

  useEffectB(() => {
    if (window.ambientPlayer) window.ambientPlayer.setVolume(volume);
  }, [volume]);

  const toggle = (id) => {
    if (!window.ambientPlayer) return;
    if (active === id) {
      window.ambientPlayer.stop();
      setActive(null);
    } else {
      window.ambientPlayer.play(id);
      setActive(id);
    }
  };

  const activePreset = SOUND_PRESETS.find(p => p.id === active);

  return (
    <div className="card col-4 card-dark">
      <div className="card-head">
        <div>
          <div className="card-title" style={{ color: "white" }}>
            <span className="ico-bubble" style={{ background: "rgba(122,155,134,0.2)", color: "#a8c7b3" }}>
              <I.Wave size={13} />
            </span>
            {tB(lang, "Ambient · focus mix", "Ambiente · enfoque")}
          </div>
          <div className="card-sub">
            {active ? (lang === "ES" ? activePreset.name.es + " · sonando" : activePreset.name.en + " · playing") : tB(lang, "Procedural · works offline", "Procedural · sin red")}
          </div>
        </div>
        <button className="card-action" style={{ color: "#a9aea4" }}>{tB(lang, "Library →", "Biblioteca →")}</button>
      </div>

      <div className="sound-grid">
        {SOUND_PRESETS.map(p => {
          const Ic = I[p.icon];
          return (
            <button key={p.id} className={"sound-tile" + (active === p.id ? " active" : "")} onClick={() => toggle(p.id)}>
              <div className="sound-ico"><Ic size={14} /></div>
              <span>{p.name[lang === "ES" ? "es" : "en"]}</span>
            </button>
          );
        })}
      </div>

      <div className="player-bar">
        <button className="player-play" onClick={() => active && toggle(active)} disabled={!active} style={{ opacity: active ? 1 : 0.5, cursor: active ? "pointer" : "not-allowed" }}>
          {active ? <I.Pause size={14} /> : <I.Play size={14} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "white", marginBottom: 6 }}>
            {active ? (lang === "ES" ? activePreset.name.es : activePreset.name.en) : tB(lang, "Pick a soundscape →", "Elige un sonido →")}
          </div>
          <input
            type="range"
            className="vol-input"
            min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--sage) 0%, var(--sage) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ============================================
   PAPERS  — persisted progress + dynamic dates
   ============================================ */
const PapersCard = ({ lang, papers, setPapers }) => {
  const advance = (id) => {
    setPapers((arr) => arr.map(p => p.id === id ? { ...p, read: Math.min(100, p.read + 10) } : p));
  };

  return (
    <div className="card col-4">
      <div className="card-head">
        <div>
          <div className="card-title">
            <span className="ico-bubble" style={{ background: "#eef0e3", color: "#5a6a3a" }}>
              <I.Leaf size={13} />
            </span>
            {tB(lang, "Paper queue", "Lecturas")}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {tB(lang, `${papers.length} to read · click +10%`, `${papers.length} por leer · clic = +10%`)}
          </div>
        </div>
        <button className="card-action">{tB(lang, "All →", "Todos →")}</button>
      </div>

      {papers.map((p, i) => (
        <div key={p.id} style={{ paddingBottom: 8, borderBottom: i < papers.length - 1 ? "1px solid var(--line-soft)" : "none", cursor: "pointer" }} onClick={() => advance(p.id)}>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.4, marginBottom: 4 }}>
            {p.title[lang === "ES" ? "es" : "en"]}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{p.journal}</span>
            <span className="dot" />
            <span style={{ fontSize: 10.5, color: "var(--muted-2)" }}>{Tm.relativePast(p.addedAtISO, lang)}</span>
            {p.read > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--sage-deep)" }}>{p.read}%</span>
            )}
          </div>
          {p.read > 0 && (
            <div className="pmini" style={{ marginTop: 4 }}><div style={{ width: p.read + "%" }} /></div>
          )}
        </div>
      ))}

      <div style={{ fontSize: 10.5, color: "var(--muted)", textAlign: "center", marginTop: 4 }}>
        {tB(lang, "click a paper to log +10% progress", "haz clic para sumar +10%")}
      </div>
    </div>
  );
};

window.cardsLearn = { FlashcardCard, SoundsCard, PapersCard };
