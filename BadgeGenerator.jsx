import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import badgeTemplate from "./Assets/Images/Badge.png";
import logoMark from "./Assets/Images/Logo Mark.png";
import badgeFont from "./Assets/Font/Bela_Bereka_6a62aa4ee7.ttf";

const PAGE_W = 595.28;
const PAGE_H = 851.89;
const MARGIN = 22.35;
const GAP_X = 14.17;
const GAP_Y = 14.17;
const BADGE_W = 272.65;
const BADGE_H = 183.07;
const COLS = 2;
const ROWS = 4;
const SLOTS = COLS * ROWS;

const CONFERENCE_NAME = "Sodo Stadium Conference 2026";
const CONFERENCE_TAGLINE = "Badge Studio — register attendees and print stadium-ready badge sheets in minutes.";

let uid = 1;
const nextId = () => uid++;

const DEFAULT_BADGE_BG = badgeTemplate;

const FIELDS = [
  { key: "fullName", label: "Full name", left: 60, width: 130, bottom: 58 },
  { key: "sex", label: "Sex", left: 60, width: 130, bottom: 38 },
  { key: "from", label: "From", left: 190, width: 130, bottom: 58 },
  { key: "roomNumber", label: "Room number", left: 190, width: 130, bottom: 40 },
];

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

function A4Sheet({ slots, background, sheetIndex }) {
  return (
    <div className="a4-page" data-sheet-index={sheetIndex}>
      <div className="a4-grid">
        {slots.map((attendee, index) => (
          <Badge key={index} attendee={attendee} background={background} />
        ))}
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

function RegistrationForm({ onRegister, pendingCount }) {
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

      <label className="f-label">
        Full name
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Jane Doe"
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
          <option value="">ይምረጡ</option>
          <option value="ደቡብ መካከለኛ ሰበካ">ደቡብ መካከለኛ ሰበካ</option>
          <option value="ደቡብ ሰበካ">ደቡብ ሰበካ</option>
          <option value="መካከለኛ ሰበካ">መካከለኛ ሰበካ</option>
          <option value="ደቡብ ሸዋ ሰበካ">ደቡብ ሸዋ ሰበካ</option>
          <option value="ደቡብ ግሪን ሰበካ">ደቡብ ግሪን ሰበካ</option>
        </select>
      </label>

      <button type="submit" className="btn btn-primary">
        Add to badge sheet
      </button>

      <div className="slot-hint-row">
        <SlotProgress filled={pendingCount} total={SLOTS} />
        <p className="slot-hint">
          Slot {pendingCount + 1} of {SLOTS} on the current sheet
          {pendingCount === SLOTS - 1 ? " — this completes the sheet!" : ""}
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
        <span className="panel-eyebrow">Optional</span>
        <h2>Badge template</h2>
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
            <span className="panel-eyebrow home-eyebrow">Attendee Badge Studio</span>
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
                <span>Badges per A4 sheet</span>
              </div>
            </div>

            <button type="button" className="btn btn-primary btn-lg" onClick={onEnter}>
              Enter Badge Studio →
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

export default function BadgeGenerator() {
  const [page, setPage] = useState("home");
  const [background, setBackground] = useState(DEFAULT_BADGE_BG);
  const [pending, setPending] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selected, setSelected] = useState("pending");

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

  const register = (data) => {
    const attendee = { id: nextId(), ...data };
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
    setPending([]);
    setSheets([]);
    setSelected("pending");
  };

  const removePending = (id) => {
    setPending((prev) => prev.filter((attendee) => attendee.id !== id));
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
  const totalAttendees = sheets.length * SLOTS + pending.length;

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
        <header className="topbar glass-panel">
          <div>
            <span className="panel-eyebrow">{CONFERENCE_NAME}</span>
            <h1>Badge Studio</h1>
            <p>Register attendees and generate an 8-up badge sheet ready for print or PDF export.</p>
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
              className={"sheet-tab" + (selected === "pending" ? " active" : "")}
              onClick={() => setSelected("pending")}
            >
              <span>In progress</span>
              <span className="count">{pending.length}/{SLOTS}</span>
            </button>

            {sheets.map((sheet, index) => (
              <div key={index} className="sheet-tab-row">
                <button
                  className={"sheet-tab" + (selected === index ? " active" : "")}
                  onClick={() => setSelected(index)}
                >
                  <span>Sheet {index + 1}</span>
                  <span className="count">8/8 ✓</span>
                </button>
              </div>
            ))}

            {pending.length > 0 && (
              <div className="pending-list">
                {pending.map((attendee) => (
                  <div key={attendee.id} className="pending-item">
                    <span>{attendee.fullName}</span>
                    <button onClick={() => removePending(attendee.id)} aria-label="Remove">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="preview-toolbar glass-panel">
          <div>
            <strong>
              {viewingIsSealed
                ? `Sheet ${selected + 1} of ${sheets.length}`
                : "Current sheet (in progress)"}
            </strong>
            <span className="muted"> — A4 portrait · 8 badges · 100% scale</span>
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
            <A4Sheet slots={viewingSheet} background={background} sheetIndex={selected} />
          </div>
        </div>

        <Footer />
      </div>

      <div className="print-layer">
        <div data-print-scope="single">
          <A4Sheet slots={viewingSheet} background={background} sheetIndex="print-single" />
        </div>
        <div data-print-scope="all">
          {sheets.map((sheet, index) => (
            <A4Sheet key={index} slots={sheet} background={background} sheetIndex={index} />
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
  --font-amharic: 'Noto Sans Ethiopic', 'Nyala', sans-serif;
  --font-display: 'Sora', var(--font-amharic), sans-serif;
  --font-body: 'Inter', var(--font-amharic), sans-serif;
}
@font-face {
  font-family: 'Bela Bereka';
  src: url('${badgeFont}') format('truetype');
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

/* ---------- App shell ---------- */
.ui-layer { max-width: 1180px; margin: 0 auto; padding: 28px 24px 80px; }
.topbar { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 22px; padding: 22px 26px; }
.topbar h1 { font-family: var(--font-display); font-size: 26px; margin: 6px 0 4px; color: var(--ink); }
.topbar p { margin: 0; color: var(--ink-dim); font-size: 14px; }
.topbar-actions { display: flex; gap: 10px; }

.layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
.form-stack { display: flex; flex-direction: column; gap: 16px; }
.reg-form { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.reg-form h2 { font-family: var(--font-display); font-size: 18px; margin: 0; color: var(--ink); }
.panel-hint { margin: -6px 0 2px; font-size: 12px; color: var(--ink-dim); }
.bg-preview { border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; background: rgba(0,0,0,0.2); }
.bg-preview img { width: 100%; height: auto; display: block; }
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
.pending-list { margin-top: 6px; display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow: auto; }
.pending-item { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 8px; padding: 7px 9px; color: var(--ink); }
.pending-item button { border: none; background: transparent; color: #ff8a8a; cursor: pointer; font-size: 12px; }

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

/* ---------- Badge print artwork (unchanged physical layout) ---------- */
.a4-page { width: ${PAGE_W}pt; height: ${PAGE_H}pt; padding: ${MARGIN}pt; background: #fff; position: relative; }
.a4-grid { width: 100%; height: 100%; display: grid; grid-template-columns: repeat(${COLS}, ${BADGE_W}pt); grid-template-rows: repeat(${ROWS}, ${BADGE_H}pt); gap: ${GAP_Y}pt ${GAP_X}pt; justify-content: center; align-content: start; }
.badge { position: relative; width: ${BADGE_W}pt; height: ${BADGE_H}pt; }
.badge-inner { position: absolute; inset: 0; background-size: 100% 100%; background-repeat: no-repeat; background-position: center; overflow: hidden; }
.badge-empty .badge-inner { opacity: .55; }
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
  font-size: 11pt;
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