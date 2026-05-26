/* ============================================
   Modal primitives + Add forms
   ============================================ */
const { useState: useS, useEffect: useE, useRef: useR } = React;
const tM = (lang, en, es) => (lang === "ES" ? es : en);

// Resilient localizer — accepts { en, es } OR plain string
PHub.localize = (val, lang) => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val[lang === "ES" ? "es" : "en"] || val.en || val.es || "";
  return String(val);
};

/* ============================================
   Modal shell
   ============================================ */
const Modal = ({ open, onClose, title, children, footer, lang }) => {
  useE(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="datamenu-backdrop" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="datamenu-head">
          <div className="datamenu-title">{title}</div>
          <button className="icon-btn" onClick={onClose} title={tM(lang, "Close", "Cerrar")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  );
};

/* ============================================
   Form field primitives
   ============================================ */
const Field = ({ label, children }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
  </label>
);

const TextInput = (p) => <input {...p} className={"field-input " + (p.className || "")} />;
const TextArea = (p) => <textarea {...p} className={"field-input field-textarea " + (p.className || "")} />;
const Select = ({ value, onChange, options }) => (
  <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Radio = ({ value, onChange, options }) => (
  <div className="field-radio">
    {options.map(o => (
      <button
        key={o.value}
        type="button"
        className={"radio-pill" + (value === o.value ? " active" : "")}
        style={o.color ? { borderColor: value === o.value ? o.color : "var(--line)", color: value === o.value ? o.color : "var(--ink-soft)" } : {}}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/* ============================================
   Add Task
   ============================================ */
const AddTaskModal = ({ open, onClose, lang, tasks, setTasks, editing }) => {
  const isEdit = !!editing;
  const [text, setText] = useS("");
  const [groupId, setGroupId] = useS("lab");
  const [priority, setPriority] = useS("med");
  const [quadrant, setQuadrant] = useS("q2");
  const [dueDays, setDueDays] = useS("0");
  const [customDate, setCustomDate] = useS(PHub.Time.todayISO());

  useE(() => {
    if (open) {
      if (isEdit) {
        setText(PHub.localize(editing.text, lang));
        setGroupId(editing.groupId);
        setPriority(editing.priority || "med");
        setQuadrant(PHub.inferQuadrant(editing));
        setDueDays(editing.dueISO ? "custom" : "none");
        setCustomDate(editing.dueISO || PHub.Time.todayISO());
      } else {
        setText("");
        setGroupId("lab");
        setPriority("med");
        setQuadrant("q2");
        setDueDays("0");
        setCustomDate(PHub.Time.todayISO());
      }
    }
  }, [open, editing]);

  const submit = () => {
    if (!text.trim()) return;
    let dueISO = null;
    if (dueDays === "custom") dueISO = customDate;
    else if (dueDays === "none") dueISO = null;
    else dueISO = PHub.Time.daysFromNow(parseInt(dueDays, 10));

    setTasks((tk) => {
      if (isEdit) {
        return {
          ...tk,
          items: tk.items.map(i => i.id === editing.id ? { ...i, text: { en: text, es: text }, groupId, priority, quadrant, dueISO } : i)
        };
      }
      const newItem = {
        id: "t" + Date.now(),
        groupId,
        text: { en: text, es: text },
        priority,
        quadrant,
        dueISO,
        done: false,
      };
      return { ...tk, items: [...tk.items, newItem] };
    });
    onClose();
  };

  const deleteIt = () => {
    if (!confirm(tM(lang, "Delete this task?", "¿Borrar esta tarea?"))) return;
    setTasks((tk) => ({ ...tk, items: tk.items.filter(i => i.id !== editing.id) }));
    onClose();
  };

  const groupOpts = tasks.groups.map(g => ({ value: g.id, label: PHub.localize(g.name, lang) }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      lang={lang}
      title={isEdit ? tM(lang, "Edit task", "Editar tarea") : tM(lang, "Add task", "Añadir tarea")}
      footer={
        <>
          {isEdit && <button className="btn btn-danger" onClick={deleteIt}>{tM(lang, "Delete", "Borrar")}</button>}
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={onClose}>{tM(lang, "Cancel", "Cancelar")}</button>
          <button className="btn btn-primary" onClick={submit} disabled={!text.trim()}>{isEdit ? tM(lang, "Save", "Guardar") : tM(lang, "Add", "Añadir")}</button>
        </>
      }
    >
      <Field label={tM(lang, "Task", "Tarea")}>
        <TextInput autoFocus value={text} placeholder={tM(lang, "e.g. Run EIS on Cu‖Li cells", "e.g. EIS en celdas Cu‖Li")} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
      </Field>
      <Field label={tM(lang, "Project", "Proyecto")}>
        <Select value={groupId} onChange={setGroupId} options={groupOpts} />
      </Field>
      <Field label={tM(lang, "Eisenhower quadrant", "Cuadrante Eisenhower")}>
        <div className="qpicker">
          {["q1", "q2", "q3", "q4"].map(qid => {
            const q = PHub.quadrants[qid];
            return (
              <button key={qid} type="button" className={"qpicker-cell" + (quadrant === qid ? " active" : "")}
                      onClick={() => setQuadrant(qid)}
                      style={{
                        background: quadrant === qid ? q.soft : "var(--surface-2)",
                        borderColor: quadrant === qid ? q.color : "var(--line)",
                      }}>
                <span className="qpicker-badge" style={{ background: q.color }}>{qid.toUpperCase()}</span>
                <div className="qpicker-text">
                  <span className="qpicker-name" style={{ color: quadrant === qid ? q.deep : "var(--ink)" }}>{PHub.localize(q.name, lang)}</span>
                  <span className="qpicker-sub">{PHub.localize(q.sub, lang)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Field>
      <Field label={tM(lang, "Priority badge (visual only)", "Prioridad (solo visual)")}>
        <Radio
          value={priority} onChange={setPriority}
          options={[
            { value: "high", label: tM(lang, "P1 · High", "P1 · Alta"), color: "#b06b50" },
            { value: "med", label: tM(lang, "P2 · Med", "P2 · Med"), color: "#c8a87a" },
            { value: "low", label: tM(lang, "P3 · Low", "P3 · Baja"), color: "var(--sage-deep)" },
          ]}
        />
      </Field>
      <Field label={tM(lang, "Due", "Vencimiento")}>
        <Radio
          value={dueDays} onChange={setDueDays}
          options={[
            { value: "none", label: tM(lang, "No date", "Sin fecha") },
            { value: "0", label: tM(lang, "Today", "Hoy") },
            { value: "1", label: tM(lang, "Tomorrow", "Mañana") },
            { value: "7", label: tM(lang, "+ 1 week", "+ 1 sem") },
            { value: "custom", label: tM(lang, "Custom…", "Personalizado…") },
          ]}
        />
        {dueDays === "custom" && (
          <input type="date" className="field-input" style={{ marginTop: 6 }} value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
        )}
      </Field>
    </Modal>
  );
};

/* ============================================
   Add Habit
   ============================================ */
const HABIT_COLORS = ["#7a9b86", "#c8a87a", "#b06b50", "#8aa9b8", "#a48ac6", "#6b8a8a"];

const AddHabitModal = ({ open, onClose, lang, habits, setHabits }) => {
  const [name, setName] = useS("");
  const [color, setColor] = useS(HABIT_COLORS[0]);
  useE(() => { if (open) { setName(""); setColor(HABIT_COLORS[0]); } }, [open]);

  const submit = () => {
    if (!name.trim()) return;
    const newHabit = {
      id: "h" + Date.now(),
      name: { en: name, es: name },
      color,
      checks: {},
    };
    setHabits((h) => [...h, newHabit]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} lang={lang} title={tM(lang, "New habit", "Nuevo hábito")}
      footer={<>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={onClose}>{tM(lang, "Cancel", "Cancelar")}</button>
        <button className="btn btn-primary" onClick={submit} disabled={!name.trim()}>{tM(lang, "Add habit", "Añadir")}</button>
      </>}
    >
      <Field label={tM(lang, "Name", "Nombre")}>
        <TextInput autoFocus value={name} placeholder={tM(lang, "e.g. Read 30 min", "e.g. Leer 30 min")} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
      </Field>
      <Field label={tM(lang, "Color", "Color")}>
        <div className="color-row">
          {HABIT_COLORS.map(c => (
            <button key={c} type="button" className={"color-dot" + (color === c ? " active" : "")} style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>
      </Field>
    </Modal>
  );
};

/* ============================================
   Note Editor (add / edit)
   ============================================ */
const NoteEditorModal = ({ open, onClose, lang, notes, setNotes, editing }) => {
  const isEdit = !!editing;
  const [title, setTitle] = useS("");
  const [body, setBody] = useS("");
  const [tag, setTag] = useS("research");
  useE(() => {
    if (open) {
      if (isEdit) {
        setTitle(PHub.localize(editing.title, lang));
        setBody(PHub.localize(editing.snippet, lang));
        setTag(editing.tag || "research");
      } else {
        setTitle(""); setBody(""); setTag("research");
      }
    }
  }, [open, editing]);

  const tagColorMap = { research: "sage", protocol: undefined, meeting: "sky", español: "rust", idea: undefined };

  const submit = () => {
    if (!title.trim()) return;
    setNotes((arr) => {
      if (isEdit) {
        return arr.map(n => n.id === editing.id ? { ...n, title: { en: title, es: title }, snippet: { en: body, es: body }, tag, tagColor: tagColorMap[tag], updatedISO: PHub.Time.todayISO() } : n);
      }
      return [{
        id: "n" + Date.now(),
        title: { en: title, es: title },
        snippet: { en: body, es: body },
        tag,
        tagColor: tagColorMap[tag],
        updatedISO: PHub.Time.todayISO(),
      }, ...arr];
    });
    onClose();
  };

  const deleteIt = () => {
    if (!confirm(tM(lang, "Delete this note?", "¿Borrar esta nota?"))) return;
    setNotes((arr) => arr.filter(n => n.id !== editing.id));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} lang={lang}
      title={isEdit ? tM(lang, "Edit note", "Editar nota") : tM(lang, "New note", "Nueva nota")}
      footer={<>
        {isEdit && <button className="btn btn-danger" onClick={deleteIt}>{tM(lang, "Delete", "Borrar")}</button>}
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={onClose}>{tM(lang, "Cancel", "Cancelar")}</button>
        <button className="btn btn-primary" onClick={submit} disabled={!title.trim()}>{isEdit ? tM(lang, "Save", "Guardar") : tM(lang, "Add", "Añadir")}</button>
      </>}
    >
      <Field label={tM(lang, "Title", "Título")}>
        <TextInput autoFocus value={title} placeholder={tM(lang, "e.g. SEI XPS analysis", "e.g. Análisis SEI XPS")} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label={tM(lang, "Body", "Contenido")}>
        <TextArea rows="6" value={body} placeholder={tM(lang, "Free-form notes, observations, results…", "Notas, observaciones…")} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <Field label={tM(lang, "Tag", "Etiqueta")}>
        <Radio
          value={tag} onChange={setTag}
          options={[
            { value: "research", label: tM(lang, "Research", "Investigación") },
            { value: "protocol", label: tM(lang, "Protocol", "Protocolo") },
            { value: "meeting", label: tM(lang, "Meeting", "Reunión") },
            { value: "idea", label: tM(lang, "Idea", "Idea") },
            { value: "español", label: "Español" },
          ]}
        />
      </Field>
    </Modal>
  );
};

/* ============================================
   Add Event
   ============================================ */
const AddEventModal = ({ open, onClose, lang, events, setEvents }) => {
  const [title, setTitle] = useS("");
  const [date, setDate] = useS(PHub.Time.daysFromNow(7));
  const [time, setTime] = useS("14:00");
  const [venue, setVenue] = useS("");
  useE(() => { if (open) { setTitle(""); setDate(PHub.Time.daysFromNow(7)); setTime("14:00"); setVenue(""); } }, [open]);

  const submit = () => {
    if (!title.trim()) return;
    setEvents((arr) => [...arr, {
      id: "e" + Date.now(),
      title: { en: title, es: title },
      dateTime: `${date}T${time}:00`,
      venue: venue || undefined,
    }]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} lang={lang} title={tM(lang, "Add event", "Añadir evento")}
      footer={<>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={onClose}>{tM(lang, "Cancel", "Cancelar")}</button>
        <button className="btn btn-primary" onClick={submit} disabled={!title.trim()}>{tM(lang, "Add", "Añadir")}</button>
      </>}
    >
      <Field label={tM(lang, "Event title", "Título")}>
        <TextInput autoFocus value={title} placeholder={tM(lang, "e.g. Group meeting", "e.g. Reunión de grupo")} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="field-row">
        <Field label={tM(lang, "Date", "Fecha")}>
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={tM(lang, "Time", "Hora")}>
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Field label={tM(lang, "Venue (optional)", "Lugar (opcional)")}>
        <TextInput value={venue} placeholder={tM(lang, "e.g. Noyes 153", "e.g. Noyes 153")} onChange={(e) => setVenue(e.target.value)} />
      </Field>
    </Modal>
  );
};

window.modals = { AddTaskModal, AddHabitModal, NoteEditorModal, AddEventModal };
