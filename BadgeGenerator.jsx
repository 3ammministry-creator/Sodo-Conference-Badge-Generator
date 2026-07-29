import React, { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as XLSX from "xlsx";
import badgeTemplate from "./Assets/Images/Badge.png";
import logoMark from "./Assets/Images/Logo Mark.png";
import sodoConferenceLogo from "./Assets/Images/Sodo Conference Logo.png";
import badgeFont from "./Assets/Font/Bela_Bereka_6a62aa4ee7.ttf";
import balderasuFont from "./Assets/Font/Balderasu_Regular.ttf";

const PAGE_W = 595.28;
const PAGE_H = 851.89;
const MARGIN = 22.35;
const GAP_X = 14.17;
const GAP_Y = 14.17;
const BADGE_W = 273.65;
const BADGE_H = 184.07;
const COLS = 2;
const ROWS = 4;
const SLOTS = COLS * ROWS;

const CONFERENCE_NAME = "Sodo Stadium Conference 2026";
const CONFERENCE_TAGLINE =
  "Card Studio — register attendees once, then print badges and meal cards from the same roster.";

let uid = 1;
const nextId = () => uid++;

const DEFAULT_BADGE_BG = badgeTemplate;

const FIELDS = [
  { key: "fullName", label: "Full name", left: 60, width: 130, bottom: 58 },
  { key: "sex", label: "Sex", left: 60, width: 130, bottom: 38 },
  { key: "from", label: "From", left: 190, width: 130, bottom: 58 },
  { key: "roomNumber", label: "Room number", left: 190, width: 130, bottom: 40 },
];

// Options for the "from" (ስምምነት/ደቡብ ሰበካ) select, shared between the
// registration form and the inline edit form so they never drift apart.
const FROM_OPTIONS = [
  "ይምረጡ",
  "ደቡብ መካከለኛ ሰበካ",
  "ደቡብ ሰበካ",
  "መካከለኛ ሰበካ",
  "ደቡብ ሸዋ ሰበካ",
  "ደቡብ ግሪን ሰበካ",
  "ደቡብ ምስራቅ ሰበካ",
  "ገናሌ ቤዚን ሰበካ",
  "ሰሜን ሰበካ",
  "ሰሜን ምስራቅ ሰበካ",
];

const MEAL_DAYS = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
const MEAL_TYPES = ["ቁርስ", "ምሳ", "እራት"];

// QR code placement, in the same pt units/coordinate space as FIELDS
// (left/bottom measured from the badge's own left/bottom edge). Tweak
// these three numbers to line the code up with empty space on your
// specific background artwork.
const QR_SIZE = 50; // pt, ~16mm square
const QR_LEFT = 180;
const QR_BOTTOM = 80;

// Plain-text payload encoded into the QR. Any standard QR scanner
// (camera app, dedicated scanner, etc.) will show this directly —
// no server, app, or lookup required.
function buildQrPayload(attendee) {
  return [
    `Name: ${attendee.fullName || "-"}`,
    `Sex: ${attendee.sex || "-"}`,
    `From: ${attendee.from || "-"}`,
    `Room: ${attendee.roomNumber || "-"}`,
    `Badge ID: ${attendee.id ?? "-"}`,
  ].join("\n");
}

function CropMarks() {
  const len = .5;
  const corners = ["tl", "tr", "bl", "br"];
  return (
    <>
      {corners.map((corner) => (
        <div key={corner} className={`crop crop-${corner}`}>
          <span className="crop-h" style={{ width: len }} />
          <span className="crop-v" style={{ height: len }} />
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Badge card (photo-background template with text/QR overlaid on top)
// ---------------------------------------------------------------------------
function Badge({ attendee, background }) {
  const empty = !attendee;
  return (
    <div className={"badge" + (empty ? " badge-empty" : "")}>
      <CropMarks />
      <div className="badge-inner" style={{ backgroundImage: `url(${background})` }}>
        {FIELDS.map((field) => (
          <div
            key={field.key}
            className="field-overlay"
            style={{ left: `${field.left}pt`, width: `${field.width}pt`, bottom: `${field.bottom}pt` }}
          >
            <span className="field-text">{attendee ? attendee[field.key] || "" : ""}</span>
          </div>
        ))}

        {attendee && (
          <div
            className="qr-overlay"
            style={{ left: `${QR_LEFT}pt`, bottom: `${QR_BOTTOM}pt`, width: `${QR_SIZE}pt`, height: `${QR_SIZE}pt` }}
          >
            <QRCodeSVG
              value={buildQrPayload(attendee)}
              size={QR_SIZE}
              level="M"
              bgColor="#ffffff"
              fgColor="#1a1a1a"
              marginSize={1}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meal card (fully coded — logo, event name, attendee info, and a compact
// breakfast/lunch/dinner x Mon–Sun checkbox grid). No background artwork
// needed, so it works the moment you register someone.
// ---------------------------------------------------------------------------
function MealCard({ attendee, eventName, logo }) {
  const empty = !attendee;
  return (
    <div className={"badge mealcard" + (empty ? " badge-empty" : "")}>
      <CropMarks />
      <div className="mealcard-inner">
        <div className="mealcard-header">
          <div className="mealcard-logo">
            {logo ? <img src={logo} alt="ministry logo" /> : <span className="mealcard-logo-fallback">LOGO</span>}
          </div>
          <div className="mealcard-event">
            <span className="mealcard-event-name">{eventName || "Event"}</span>
            {attendee && <span className="mealcard-name">{attendee.fullName}</span>}
          </div>
          {attendee && (
            <div className="mealcard-qr">
              <QRCodeSVG
                value={buildQrPayload(attendee)}
                size={30}
                level="M"
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                marginSize={0}
              />
            </div>
          )}
        </div>

        {attendee && (
        <div className="mealcard-meta">
  <span>{attendee.sex || "-"}</span>
  <span> | </span>
  <span>{attendee.from || "-"}</span>
  <span> | </span>
  <span>ከፍል {attendee.roomNumber || "-"}</span>
</div>
        )}

        <div className="meal-table">
          <div className="meal-row meal-row-head">
            <span className="meal-label" />
            {MEAL_DAYS.map((day) => (
              <span key={day} className="meal-day-head">
                {day}
              </span>
            ))}
          </div>
          {MEAL_TYPES.map((meal) => (
            <div key={meal} className="meal-row">
              <span className="meal-label">{meal}</span>
              {MEAL_DAYS.map((day) => (
                <span key={day} className="meal-checkbox" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function A4Sheet({ slots, cardType, background, mealEventName, mealLogo, sheetIndex }) {
  return (
    <div className="a4-page" data-sheet-index={sheetIndex}>
      <div className="a4-grid">
        {slots.map((attendee, index) =>
          cardType === "meal" ? (
            <MealCard key={index} attendee={attendee} eventName={mealEventName} logo={mealLogo} />
          ) : (
            <Badge key={index} attendee={attendee} background={background} />
          )
        )}
      </div>
    </div>
  );
}

function SlotProgress({ filled, total }) {
  return (
    <div className="slot-dots" role="img" aria-label={`${filled} of ${total} slots filled`}>
      {Array.from({ length: total }).map((_, index) => (
        <span key={index} className={"dot" + (index < filled ? " filled" : "")} />
      ))}
    </div>
  );
}

function CardTypeToggle({ cardType, setCardType }) {
  return (
    <div className="glass-panel card-type-panel">
      <div className="panel-head">
        <span className="panel-eyebrow">Output</span>
        <h2>What are you printing?</h2>
      </div>
      <div className="card-type-toggle" role="tablist" aria-label="Card type">
        <button
          type="button"
          role="tab"
          aria-selected={cardType === "badge"}
          className={"card-type-btn" + (cardType === "badge" ? " active" : "")}
          onClick={() => setCardType("badge")}
        >
          Badge cards
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={cardType === "meal"}
          className={"card-type-btn" + (cardType === "meal" ? " active" : "")}
          onClick={() => setCardType("meal")}
        >
          Meal cards
        </button>
      </div>
      <p className="panel-hint">
        Same roster either way — switch anytime, your attendees and sheets don't change.
      </p>
    </div>
  );
}

function RegistrationForm({ onRegister, fillTarget }) {
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("");
  const [from, setFrom] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!fullName.trim()) return;
    onRegister({
      fullName: fullName.trim(),
      sex: sex.trim(),
      from: from.trim(),
      roomNumber: roomNumber.trim(),
    });
    setFullName("");
    setSex("");
    setFrom("");
    setRoomNumber("");
  };

  return (
    <form className="glass-panel reg-form" onSubmit={submit}>
      <div className="panel-head">
        <span className="panel-eyebrow">Step 1</span>
        <h2>Register attendee</h2>
      </div>

      {fillTarget.isSheet && (
        <div className="fill-target-banner">
          Filling an empty slot on <strong>{fillTarget.label}</strong>
        </div>
      )}

      <label className="f-label">
        Full name
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Meti Black"
          required
        />
      </label>

      <div className="f-row">
        <label className="f-label">
          ጾታ
          <select value={sex} onChange={(event) => setSex(event.target.value)}>
            <option value="">ይምረጡ</option>
            <option value="ወንድ">ወንድ</option>
            <option value="ሴት">ሴት</option>
          </select>
        </label>
        <label className="f-label">
          ክፍል
          <input
            value={roomNumber}
            onChange={(event) => setRoomNumber(event.target.value)}
            placeholder="204"
          />
        </label>
      </div>

      <label className="f-label">
        ስምምነት/ደቡብ ሰበካ
        <select value={from} onChange={(event) => setFrom(event.target.value)}>
          {FROM_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="btn btn-primary">
        Add to card sheet
      </button>

      <div className="slot-hint-row">
        <SlotProgress filled={fillTarget.filled} total={SLOTS} />
        <p className="slot-hint">
          Slot {fillTarget.filled + 1} of {SLOTS} on {fillTarget.label}
          {fillTarget.filled === SLOTS - 1 ? " — this completes the sheet!" : ""}
        </p>
      </div>
    </form>
  );
}

function TemplatePanel({ background, setBackground }) {
  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackground(reader.result);
    reader.readAsDataURL(file);
  };

  const resetDefault = () => setBackground(DEFAULT_BADGE_BG);

  return (
    <div className="glass-panel reg-form template-form">
      <div className="panel-head">
        <span className="panel-eyebrow">Badge template</span>
        <h2>Background artwork</h2>
      </div>
      <p className="panel-hint">
        Your badge artwork is used as-is; typed values are overlaid right onto its blank lines.
      </p>
      <div className="bg-preview">
        <img src={background} alt="badge template preview" />
      </div>
      <label className="f-label file-label">
        Replace background image
        <input type="file" accept="image/*" onChange={handleUpload} />
      </label>
      <button type="button" className="btn btn-ghost" onClick={resetDefault}>
        Reset to default template
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="app-footer no-print">
      Developed by <strong>3AMMM media team</strong>
    </footer>
  );
}

function HomePage({ onEnter, totalSheets, totalAttendees }) {
  return (
    <div className="home-root">
      <div className="home-glow glow-a" />
      <div className="home-glow glow-b" />
      <div className="home-glow glow-c" />

      <div className="home-content">
        <nav className="home-nav">
          <span className="brand-mark">SSC · 2026</span>
        </nav>

        <div className="home-hero">
          <div className="home-copy">
            <span className="panel-eyebrow home-eyebrow">Badge &amp; Meal Card Studio</span>
            <h1 className="home-title">
              {CONFERENCE_NAME.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="home-title-accent">{CONFERENCE_NAME.split(" ").slice(-1)}</span>
            </h1>
            <p className="home-tagline">{CONFERENCE_TAGLINE}</p>

            <div className="home-stats">
              <div className="glass-chip">
                <strong>{totalAttendees}</strong>
                <span>Attendees registered</span>
              </div>
              <div className="glass-chip">
                <strong>{totalSheets}</strong>
                <span>Sheets ready to print</span>
              </div>
              <div className="glass-chip">
                <strong>{SLOTS}</strong>
                <span>Cards per A4 sheet</span>
              </div>
            </div>

            <button type="button" className="btn btn-primary btn-lg" onClick={onEnter}>
              Enter Card Studio →
            </button>
          </div>

          <div className="home-visual">
            <div className="logo-frame">
              <div className="logo-frame-glow" />
              <div className="logo-frame-plate">
                <img src={logoMark} alt="Sodo Stadium Conference logo" className="logo-frame-img" />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default function CardStudio() {
  const [page, setPage] = useState("home");
  const [cardType, setCardType] = useState("badge"); // "badge" | "meal"
  const [background, setBackground] = useState(DEFAULT_BADGE_BG);
  const [pending, setPending] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selected, setSelected] = useState("pending");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@500;700&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Use the conference logo mark as the browser tab favicon.
  useEffect(() => {
    const existing = Array.from(document.querySelectorAll("link[rel*='icon']"));
    const icon = existing[0] || document.createElement("link");
    icon.rel = "icon";
    icon.href = logoMark;
    if (!existing.length) document.head.appendChild(icon);
    existing.slice(1).forEach((extra) => extra.parentNode.removeChild(extra));
  }, []);

  useEffect(() => {
    const cleanupPrintMode = () => document.body.removeAttribute("data-print-mode");
    window.addEventListener("afterprint", cleanupPrintMode);
    return () => {
      window.removeEventListener("afterprint", cleanupPrintMode);
      cleanupPrintMode();
    };
  }, []);

  // Toast auto-dismiss.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (type, message) => setToast({ type, message });

  // If a sealed sheet is selected and has an empty slot (from a previous
  // removal), new registrations fill that slot in place — keeping the
  // attendee on the sheet the user is actively looking at — instead of
  // always starting/growing the in-progress sheet. Once that sheet has no
  // empty slots left, registrations fall back to the normal flow below.
  const targetSheetIndex =
    selected !== "pending" && sheets[selected] && sheets[selected].some((a) => a === null)
      ? selected
      : null;

  const fillTarget =
    targetSheetIndex !== null
      ? {
          isSheet: true,
          label: `Sheet ${targetSheetIndex + 1}`,
          filled: sheets[targetSheetIndex].filter(Boolean).length,
        }
      : {
          isSheet: false,
          label: "the current sheet (in progress)",
          filled: pending.length,
        };

  const register = (data) => {
    const attendee = { id: nextId(), ...data };

    if (targetSheetIndex !== null) {
      setSheets((prev) =>
        prev.map((sheet, idx) => {
          if (idx !== targetSheetIndex) return sheet;
          const emptyIndex = sheet.findIndex((a) => a === null);
          if (emptyIndex === -1) return sheet;
          const next = [...sheet];
          next[emptyIndex] = attendee;
          return next;
        })
      );
      return;
    }

    setPending((prev) => {
      const next = [...prev, attendee];
      if (next.length === SLOTS) {
        setSheets((currentSheets) => {
          const updated = [...currentSheets, next];
          setSelected(updated.length - 1);
          return updated;
        });
        return [];
      }
      setSelected("pending");
      return next;
    });
  };

  const clearAll = () => {
    if (!window.confirm("Reset everything? This clears the in-progress sheet and all sealed sheets.")) {
      return;
    }
    setPending([]);
    setSheets([]);
    setSelected("pending");
  };

  const removePending = (id) => {
    setPending((prev) => prev.filter((attendee) => attendee.id !== id));
  };

  // Fix a mistake on a pending attendee (name, sex, from, room) without
  // removing and re-registering them.
  const updatePending = (id, data) => {
    setPending((prev) =>
      prev.map((attendee) => (attendee.id === id ? { ...attendee, ...data } : attendee))
    );
  };

  // Same fix-in-place editing, but for an attendee on an already-sealed
  // sheet. The slot position is preserved so the badge/meal card layout
  // doesn't shift, and it affects both badge and meal card output since
  // they read from the same roster.
  const updateSheetAttendee = (sheetIndex, attendeeId, data) => {
    setSheets((prev) =>
      prev.map((sheet, idx) =>
        idx === sheetIndex
          ? sheet.map((attendee) => (attendee && attendee.id === attendeeId ? { ...attendee, ...data } : attendee))
          : sheet
      )
    );
  };

  // Removing someone from a sealed sheet clears their slot rather than
  // reflowing the rest of the sheet, so nobody else's card position moves.
  const removeSheetAttendee = (sheetIndex, attendeeId) => {
    setSheets((prev) =>
      prev.map((sheet, idx) =>
        idx === sheetIndex
          ? sheet.map((attendee) => (attendee && attendee.id === attendeeId ? null : attendee))
          : sheet
      )
    );
  };

  // Deletes an entire sealed sheet. Selection is re-pointed so it never
  // ends up referencing a sheet index that no longer exists.
  const deleteSheet = (sheetIndex) => {
    if (!window.confirm(`Delete Sheet ${sheetIndex + 1}? This can't be undone.`)) return;
    setSheets((prev) => prev.filter((_, idx) => idx !== sheetIndex));
    setSelected((prevSelected) => {
      if (prevSelected === "pending") return prevSelected;
      if (prevSelected === sheetIndex) return "pending";
      if (prevSelected > sheetIndex) return prevSelected - 1;
      return prevSelected;
    });
  };

  const pendingSlots = useMemo(() => {
    const slots = [...pending];
    while (slots.length < SLOTS) slots.push(null);
    return slots;
  }, [pending]);

  const printOne = () => {
    document.body.setAttribute("data-print-mode", "single");
    window.print();
  };

  const printAll = () => {
    document.body.setAttribute("data-print-mode", "all");
    window.print();
  };

  const viewingSheet = selected === "pending" ? pendingSlots : sheets[selected] || pendingSlots;
  const viewingIsSealed = selected !== "pending";
  const totalAttendees =
    sheets.reduce((sum, sheet) => sum + sheet.filter(Boolean).length, 0) + pending.length;
  const cardLabel = cardType === "meal" ? "meal cards" : "badges";

  if (page === "home") {
    return (
      <div className="app-root">
        <style>{CSS}</style>
        <HomePage
          onEnter={() => setPage("app")}
          totalSheets={sheets.length}
          totalAttendees={totalAttendees}
        />
      </div>
    );
  }

  return (
    <div className="app-root">
      <style>{CSS}</style>

      <div className="ui-layer no-print">
        {toast && (
          <div className={"toast toast-" + toast.type} role="status">
            {toast.message}
          </div>
        )}

        <header className="topbar glass-panel">
          <div>
            <span className="panel-eyebrow">{CONFERENCE_NAME}</span>
            <h1>Card Studio</h1>
            <p>Register attendees once and generate an 8-up badge or meal card sheet ready for print or PDF export.</p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost" onClick={() => setPage("home")}>
              ← Home
            </button>
            <button className="btn btn-ghost" onClick={clearAll}>
              Reset all
            </button>
          </div>
        </header>

        <div className="layout">
          <div className="form-stack">
            <RegistrationForm onRegister={register} pendingCount={pending.length} />
            <TemplatePanel background={background} setBackground={setBackground} />
          </div>

          <aside className="glass-panel sheets-panel">
            <div className="panel-head">
              <span className="panel-eyebrow">Overview</span>
              <h3>Sheets</h3>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-export-roster"
              onClick={exportRosterToExcel}
            >
              Export roster (.xlsx)
            </button>
            <button
              className={"sheet-tab" + (selected === "pending" ? " active" : "")}
              onClick={() => setSelected("pending")}
            >
              <span>In progress</span>
              <span className="count">{pending.length}/{SLOTS}</span>
            </button>

            {sheets.map((sheet, index) => {
              const filled = sheet.filter(Boolean).length;
              return (
                <button
                  key={index}
                  className={"sheet-tab" + (selected === index ? " active" : "")}
                  onClick={() => setSelected(index)}
                >
                  <span>Sheet {index + 1}</span>
                  <span className="count">
                    {filled}/{SLOTS}
                    {filled === SLOTS ? " ✓" : ""}
                  </span>
                </button>
              );
            })}

            <p className="pending-list-hint">Click any name below to fix a typo — works on sealed sheets too.</p>
            <AttendeeListPanel
              selected={selected}
              pending={pending}
              sheets={sheets}
              onUpdatePending={updatePending}
              onRemovePending={removePending}
              onUpdateSheetAttendee={updateSheetAttendee}
              onRemoveSheetAttendee={removeSheetAttendee}
              onDeleteSheet={deleteSheet}
            />
          </aside>
        </div>

        <div className="preview-toolbar glass-panel">
          <div>
            <strong>
              {viewingIsSealed
                ? `Sheet ${selected + 1} of ${sheets.length}`
                : "Current sheet (in progress)"}
            </strong>
            <span className="muted"> — A4 portrait · {SLOTS} {cardLabel} · 100% scale</span>
          </div>
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={printOne}>
              Print / Export This Sheet
            </button>
            <button className="btn btn-primary" disabled={sheets.length === 0} onClick={printAll}>
              Print / Export All Sealed Sheets ({sheets.length})
            </button>
          </div>
        </div>

        <div className="preview-scroll">
          <div className="preview-scale">
            <A4Sheet
              slots={viewingSheet}
              cardType={cardType}
              background={background}
              mealEventName={mealEventName}
              mealLogo={mealLogo}
              sheetIndex={selected}
            />
          </div>
        </div>

        <Footer />
      </div>

      <div className="print-layer">
        <div data-print-scope="single">
          <A4Sheet
            slots={viewingSheet}
            cardType={cardType}
            background={background}
            mealEventName={mealEventName}
            mealLogo={mealLogo}
            sheetIndex="print-single"
          />
        </div>
        <div data-print-scope="all">
          {sheets.map((sheet, index) => (
            <A4Sheet
              key={index}
              slots={sheet}
              cardType={cardType}
              background={background}
              mealEventName={mealEventName}
              mealLogo={mealLogo}
              sheetIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const CSS = `
:root {
  --ink: #f2f3f6;
  --ink-dim: #9aa1b0;
  --navy-deep: #0a0b0f;
  --navy-mid: #131519;
  --navy-soft: #1c1f26;

  /* Brand palette — derived from conference brand color #b75c27.
     This is the single accent color used across the UI; no other
     hues are introduced, for a calmer, more professional look. */
  --brand-100: #f6e4d8;
  --brand-200: #edc8ac;
  --brand-300: #e0a373;
  --brand-400: #cf8353;
  --brand-500: #b75c27; /* base brand color */
  --brand-600: #9c4e21;
  --brand-700: #80401b;
  --brand-800: #653315;
  --brand-900: #492510;

  --gold: var(--brand-500);
  --gold-soft: var(--brand-300);
  --accent: var(--brand-500);
  --accent-soft: var(--brand-300);
  --sheen: rgba(255, 255, 255, 0.5);
  --glass-bg: rgba(255, 255, 255, 0.045);
  --glass-bg-strong: rgba(255, 255, 255, 0.085);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  --crop: #9a9a9a;
  --font-amharic: 'Balderasu', 'Noto Sans Ethiopic', 'Nyala', sans-serif;
  --font-display: 'Sora', var(--font-amharic), sans-serif;
  --font-body: 'Inter', var(--font-amharic), sans-serif;
}
@font-face {
  font-family: 'Bela Bereka';
  src: url('${badgeFont}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Balderasu';
  src: url('${balderasuFont}') format('truetype');
  font-display: swap;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  min-height: 100vh;
  font-family: var(--font-body);
  color: var(--ink);
  background:
    radial-gradient(1100px 600px at 12% -12%, rgba(183, 92, 39, 0.16), transparent 60%),
    radial-gradient(900px 600px at 108% 8%, rgba(255, 255, 255, 0.05), transparent 55%),
    radial-gradient(1000px 700px at 50% 120%, rgba(183, 92, 39, 0.08), transparent 60%),
    linear-gradient(180deg, var(--navy-deep), var(--navy-mid) 55%, var(--navy-soft));
  background-attachment: fixed;
}
.app-root { min-height: 100vh; }

/* ---------- Glass primitives ---------- */
.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  box-shadow: var(--glass-shadow), inset 0 1px 0 rgba(255,255,255,0.08);
}
.panel-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 2px; }
.panel-eyebrow {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-soft);
}

/* ---------- Buttons ---------- */
.btn {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  border-radius: 12px;
  padding: 11px 18px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform .14s ease, box-shadow .14s ease, filter .14s ease;
}
.btn:active { transform: translateY(1px) scale(0.99); }
.btn-primary {
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  color: #21170a;
  box-shadow: 0 8px 24px rgba(183, 92, 39, 0.35);
}
.btn-primary:hover { filter: brightness(1.06); }
.btn-primary:disabled { opacity: .35; cursor: not-allowed; box-shadow: none; }
.btn-lg { padding: 15px 26px; font-size: 15px; border-radius: 14px; }
.btn-secondary {
  background: var(--glass-bg-strong);
  color: var(--ink);
  border-color: var(--glass-border);
  backdrop-filter: blur(12px);
}
.btn-secondary:hover { background: rgba(255,255,255,0.15); }
.btn-ghost {
  background: transparent;
  color: var(--ink-dim);
  border-color: var(--glass-border);
}
.btn-ghost:hover { color: var(--ink); border-color: rgba(255,255,255,0.3); }
.btn-template-download { align-self: flex-start; font-size: 12px; padding: 8px 12px; }
.btn-export-roster { width: 100%; font-size: 12.5px; padding: 8px 12px; }

/* ---------- App shell ---------- */
.ui-layer { max-width: 1180px; margin: 0 auto; padding: 28px 24px 80px; position: relative; }
.topbar { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 22px; padding: 22px 26px; }
.topbar h1 { font-family: var(--font-display); font-size: 26px; margin: 6px 0 4px; color: var(--ink); }
.topbar p { margin: 0; color: var(--ink-dim); font-size: 14px; }
.topbar-actions { display: flex; gap: 10px; }

.layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
.form-stack { display: flex; flex-direction: column; gap: 16px; }
.reg-form { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.reg-form h2 { font-family: var(--font-display); font-size: 18px; margin: 0; color: var(--ink); }
.panel-hint { margin: -6px 0 2px; font-size: 12px; color: var(--ink-dim); }
.fill-target-banner {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gold-soft);
  background: rgba(183, 92, 39, 0.14);
  border: 1px solid rgba(183, 92, 39, 0.35);
  border-radius: 10px;
  padding: 8px 12px;
  margin: -2px 0 2px;
}
.fill-target-banner strong { color: var(--ink); }
.bg-preview { border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; background: rgba(0,0,0,0.2); }
.bg-preview img { width: 100%; height: auto; display: block; }
.logo-only-preview { padding: 10px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); }
.logo-only-preview img { width: auto; max-width: 100%; max-height: 90px; }
.f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.f-label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--ink-dim); }
.f-label input, .f-label select {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.05);
}
.f-label select option { background: var(--navy-mid); color: var(--ink); }
.f-label input::placeholder { color: rgba(238,242,249,0.35); }
.f-label input:focus, .f-label select:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
  border-color: var(--accent);
  background: rgba(255,255,255,0.08);
}
.file-label input[type="file"] { padding: 8px 10px; font-size: 12.5px; }
.slot-hint-row { display: flex; flex-direction: column; gap: 6px; margin-top: 2px; }
.slot-hint { font-size: 12px; color: var(--ink-dim); margin: 0; }
.slot-dots { display: flex; gap: 6px; }
.slot-dots .dot { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1px solid var(--glass-border); }
.slot-dots .dot.filled { background: linear-gradient(135deg, var(--gold-soft), var(--gold)); border-color: transparent; }

/* ---------- Card type toggle ---------- */
.card-type-panel { padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; }
.card-type-panel h2 { font-family: var(--font-display); font-size: 18px; margin: 0; color: var(--ink); }
.card-type-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 12px; padding: 4px; }
.card-type-btn {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--ink-dim);
  cursor: pointer;
  transition: background .14s ease, color .14s ease;
}
.card-type-btn:hover { color: var(--ink); }
.card-type-btn.active { background: linear-gradient(135deg, var(--gold-soft), var(--gold)); color: #21170a; }

/* ---------- Excel import dropzone ---------- */
.dropzone {
  border: 1.5px dashed var(--glass-border);
  border-radius: 12px;
  padding: 22px 14px;
  text-align: center;
  font-size: 12.5px;
  color: var(--ink-dim);
  cursor: pointer;
  transition: border-color .14s ease, background .14s ease, color .14s ease;
}
.dropzone:hover, .dropzone-active {
  border-color: var(--accent);
  background: rgba(183, 92, 39, 0.08);
  color: var(--ink);
}
.dropzone-input { display: none; }

/* ---------- Toast notifications ---------- */
.toast {
  position: fixed;
  top: 22px;
  right: 22px;
  z-index: 50;
  max-width: 340px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  backdrop-filter: blur(14px);
}
.toast-success { background: rgba(34, 139, 87, 0.18); border: 1px solid rgba(34, 139, 87, 0.4); color: #b7f2d3; }
.toast-error { background: rgba(200, 60, 60, 0.18); border: 1px solid rgba(200, 60, 60, 0.4); color: #ffc4c4; }

.sheets-panel { padding: 18px; display: flex; flex-direction: column; gap: 8px; }
.sheets-panel h3 { font-family: var(--font-display); font-size: 15px; margin: 0; color: var(--ink); }
.sheet-tab {
  display: flex; justify-content: space-between; align-items: center; width: 100%;
  padding: 10px 12px; border-radius: 10px; border: 1px solid var(--glass-border);
  background: rgba(255,255,255,0.04); font-size: 13px; font-weight: 600; cursor: pointer; color: var(--ink);
  font-family: var(--font-body); transition: background .12s ease, border-color .12s ease;
}
.sheet-tab:hover { background: rgba(255,255,255,0.08); }
.sheet-tab.active { border-color: var(--accent); background: rgba(183,92,39,0.16); }
.sheet-tab .count { font-weight: 500; color: var(--ink-dim); }
.pending-list-hint { margin: 4px 0 0; font-size: 11.5px; color: var(--ink-dim); }
.attendee-list-panel { margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 8px; }
.attendee-list-head { display: flex; justify-content: space-between; align-items: baseline; }
.attendee-list-title { font-family: var(--font-display); font-size: 12.5px; font-weight: 700; color: var(--ink); }
.attendee-list-count { font-size: 11.5px; color: var(--ink-dim); font-weight: 600; }
.attendee-list-empty { margin: 2px 0 0; font-size: 12px; color: var(--ink-dim); font-style: italic; }
.btn-danger-ghost { margin-top: 4px; color: #ff9a9a; border-color: rgba(255,138,138,0.3); }
.btn-danger-ghost:hover { color: #ffb3b3; border-color: rgba(255,138,138,0.55); background: rgba(255,138,138,0.08); }
.pending-list { margin-top: 6px; display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow: auto; }
.pending-item { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 8px; padding: 4px 4px 4px 9px; color: var(--ink); }
.pending-item-empty { padding: 8px 9px; border-style: dashed; opacity: 0.6; }
.pending-item-empty-label { font-size: 12px; color: var(--ink-dim); font-style: italic; }
.pending-item-name {
  flex: 1;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 500;
  padding: 5px 4px;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pending-item-name:hover { background: rgba(183,92,39,0.16); color: var(--gold-soft); }
.pending-item-remove { border: none; background: transparent; color: #ff8a8a; cursor: pointer; font-size: 12px; padding: 6px 8px; border-radius: 6px; }
.pending-item-remove:hover { background: rgba(255,138,138,0.12); }

.pending-edit-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: rgba(183, 92, 39, 0.08);
}
.edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.edit-input {
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 7px 9px;
  background: rgba(255,255,255,0.06);
  width: 100%;
}
.edit-input:focus { outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); }
.edit-input option { background: var(--navy-mid); color: var(--ink); }
.edit-actions { display: flex; gap: 6px; margin-top: 2px; }
.btn-mini {
  flex: 1;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  padding: 7px 10px;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn-mini-save { background: linear-gradient(135deg, var(--gold-soft), var(--gold)); color: #21170a; }
.btn-mini-save:hover { filter: brightness(1.06); }
.btn-mini-cancel { background: transparent; border-color: var(--glass-border); color: var(--ink-dim); }
.btn-mini-cancel:hover { color: var(--ink); border-color: rgba(255,255,255,0.3); }

.preview-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin: 22px 0 12px; padding: 18px 22px; flex-wrap: wrap; color: var(--ink); }
.preview-toolbar .muted { color: var(--ink-dim); font-weight: 400; font-size: 13px; }
.toolbar-actions { display: flex; gap: 10px; }
.preview-scroll { overflow: auto; display: flex; justify-content: center; padding: 24px; background: rgba(0,0,0,0.22); border: 1px solid var(--glass-border); border-radius: 22px; }
.preview-scale { background: #fff; box-shadow: 0 20px 60px rgba(0,0,0,.5); border-radius: 4px; overflow: hidden; }

.app-footer {
  text-align: center;
  margin-top: 28px;
  padding: 16px 0 4px;
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--ink-dim);
  letter-spacing: 0.02em;
}
.app-footer strong { color: var(--ink); font-weight: 600; }

/* ---------- Home page ---------- */
.home-root { position: relative; min-height: 100vh; overflow: hidden; display: flex; align-items: stretch; }
.home-glow { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; pointer-events: none; animation: drift 16s ease-in-out infinite; }
.glow-a { width: 420px; height: 420px; background: var(--brand-800); top: -120px; left: -80px; animation-delay: 0s; }
.glow-b { width: 360px; height: 360px; background: var(--sheen); opacity: 0.12; top: 20%; right: -100px; animation-delay: 3s; }
.glow-c { width: 480px; height: 480px; background: var(--gold); bottom: -180px; left: 30%; animation-delay: 6s; }
@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.06); }
}
.home-content { position: relative; z-index: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 32px 24px 60px; display: flex; flex-direction: column; }
.home-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.brand-mark { font-family: var(--font-display); font-weight: 700; letter-spacing: 0.12em; color: var(--ink-dim); font-size: 13px; }
.home-hero { flex: 1; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; }
.home-copy { display: flex; flex-direction: column; gap: 18px; }
.home-eyebrow { font-size: 12px; }
.home-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2.4rem, 5vw, 4.2rem);
  line-height: 1.04;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--ink);
}
.home-title-accent {
  background: linear-gradient(120deg, var(--brand-300), var(--brand-500) 55%, var(--brand-700));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.home-tagline { font-size: 16px; color: var(--ink-dim); max-width: 46ch; margin: 0; line-height: 1.5; }
.home-stats { display: flex; gap: 12px; flex-wrap: wrap; margin: 6px 0 4px; }
.glass-chip {
  display: flex; flex-direction: column; gap: 2px;
  padding: 12px 16px; min-width: 128px;
  background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 14px;
  backdrop-filter: blur(18px);
}
.glass-chip strong { font-family: var(--font-display); font-size: 22px; color: var(--gold-soft); }
.glass-chip span { font-size: 11.5px; color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.04em; }

.home-visual { display: flex; align-items: center; justify-content: center; }

/* Logo mark presentation — brand-colored plate behind the mark, the
   mark image itself is never recolored/filtered so its true blue
   stays intact. Vertical float only (no rotation) to keep the logo
   looking intentional rather than skewed. */
.logo-frame { position: relative; width: 280px; animation: floatLogo 6s ease-in-out infinite; }
@keyframes floatLogo {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}
.logo-frame-glow {
  position: absolute; inset: -40px;
  background: radial-gradient(circle, rgba(183, 92, 39, 0.35), transparent 65%);
  filter: blur(14px);
  z-index: 0;
}
.logo-frame-plate {
  position: relative; z-index: 1;
  width: 280px; aspect-ratio: 1 / 1;
  display: flex; align-items: center; justify-content: center;
  padding: 34px;
  border-radius: 28px;
  background: linear-gradient(160deg, var(--brand-800), var(--brand-600));
  border: 1px solid rgba(255,255,255,0.25);
  box-shadow: 0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
  overflow: hidden;
}
.logo-frame-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 24px rgba(0,0,0,0.35));
}

@media (max-width: 860px) {
  .home-hero { grid-template-columns: 1fr; text-align: center; }
  .home-copy { align-items: center; }
  .home-stats { justify-content: center; }
  .home-visual { order: -1; }
  .layout { grid-template-columns: 1fr; }
}

/* ---------- Card print artwork (unchanged physical layout) ---------- */
.a4-page { width: ${PAGE_W}pt; height: ${PAGE_H}pt; padding: ${MARGIN}pt; background: #fff; position: relative; }
.a4-grid { width: 100%; height: 100%; display: grid; grid-template-columns: repeat(${COLS}, ${BADGE_W}pt); grid-template-rows: repeat(${ROWS}, ${BADGE_H}pt); gap: ${GAP_Y}pt ${GAP_X}pt; justify-content: center; align-content: start; }
.badge { position: relative; width: ${BADGE_W}pt; height: ${BADGE_H}pt; }
.badge-inner { position: absolute; inset: 0; background-size: 100% 100%; background-repeat: no-repeat; background-position: center; overflow: hidden; }
.badge-empty .badge-inner, .badge-empty .mealcard-inner { opacity: .55; }
.field-overlay { position: absolute; display: flex; align-items: flex-end; overflow: hidden; pointer-events: none; }
.qr-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 2pt;
  border-radius: 2pt;
  box-shadow: 0 0 0 0.5pt rgba(0,0,0,0.08);
}
.qr-overlay svg { display: block; }
.field-text {
  font-family: 'Bela Bereka', var(--font-amharic);
  font-size: 13pt;
  font-weight: 700;
  color: #2b2622;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 2pt;
  line-height: 1.05;
  text-shadow: 0 0 2px rgba(255,255,255,0.45);
}
.crop { position: absolute; width: 0; height: 0; pointer-events: none; }
.crop-h, .crop-v { position: absolute; background: var(--crop); }
.crop-h { height: 0.5pt; }
.crop-v { width: 0.5pt; }
.crop-tl { top: 0; left: 0; }
.crop-tl .crop-h { top: 0; right: 100%; margin-right: 1.5pt; }
.crop-tl .crop-v { left: 0; bottom: 100%; margin-bottom: 1.5pt; }
.crop-tr { top: 0; right: 0; }
.crop-tr .crop-h { top: 0; left: 100%; margin-left: 1.5pt; }
.crop-tr .crop-v { right: 0; bottom: 100%; margin-bottom: 1.5pt; }
.crop-bl { bottom: 0; left: 0; }
.crop-bl .crop-h { bottom: 0; right: 100%; margin-right: 1.5pt; }
.crop-bl .crop-v { left: 0; top: 100%; margin-top: 1.5pt; }
.crop-br { bottom: 0; right: 0; }
.crop-br .crop-h { bottom: 0; left: 100%; margin-left: 1.5pt; }
.crop-br .crop-v { right: 0; top: 100%; margin-top: 1.5pt; }
.print-layer { display: none; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  .no-print { display: none !important; }
  .print-layer { display: block !important; }
  .a4-page { page-break-after: always; break-after: page; box-shadow: none !important; }
  .a4-page:last-child { page-break-after: auto; }
  [data-print-scope] { display: none; }
  body[data-print-mode="single"] [data-print-scope="single"] { display: block; }
  body[data-print-mode="all"] [data-print-scope="all"] { display: block; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;
