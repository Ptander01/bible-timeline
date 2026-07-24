# Bible Timeline → Portfolio UI Handoff

Source: `pauls-world`/`bible-timeline` sister apps (React + Vite, plain CSS, no
Tailwind). Font stack is **Cinzel / Cormorant Garamond / Lora**, not
Playfair Display / DM Sans / Space Mono — swap in your existing stack, none
of this is coupled to these specific fonts. Colors below are the **dark**
theme; light/"parchment" theme overrides are included for each block since
the whole system is token-driven and re-themes almost for free.

---

## 1. Design tokens (`:root` / `[data-theme="light"]`)

```css
:root {
  --bg:         #0a0d1a;
  --bg-panel:   rgba(10, 13, 26, 0.55);
  --bg-card:    rgba(13, 16, 32, 0.65);
  --border:     rgba(201, 168, 76, 0.2);
  --border-lt:  rgba(201, 168, 76, 0.1);

  /* glass */
  --glass-bg:     rgba(13, 16, 32, 0.55);
  --glass-border: rgba(255, 255, 255, 0.09);
  --glass-shine:  rgba(255, 255, 255, 0.06);
  --glass-blur:   blur(18px);

  /*
   * 3D "lip" system — the soft neumorphic depth used on every pill/card.
   * --lip-out  : resting/lifted surface (outer drop + top specular + bottom depth + rim)
   * --lip-in   : pressed/active surface (deep inset track)
   * --lip-hover: transitional (more lift + accent rim glow)
   * --lip-in-gold: same as --lip-in but with a gold rim + glow, for the "selected" state
   */
  --lip-out:
    0 6px 18px rgba(0,0,0,0.65),
    0 2px 5px  rgba(0,0,0,0.45),
    inset 0  1px 0 rgba(255,255,255,0.09),
    inset 0 -1px 0 rgba(0,0,0,0.50),
    inset 0  0   0 1px rgba(255,255,255,0.04);

  --lip-hover:
    0 8px 22px rgba(0,0,0,0.70),
    0 3px 7px  rgba(0,0,0,0.50),
    inset 0  1px 0 rgba(255,255,255,0.13),
    inset 0 -1px 0 rgba(0,0,0,0.55),
    inset 0  0   0 1px rgba(255,255,255,0.07),
    0 0 14px rgba(201,168,76,0.12);

  --lip-in:
    inset 0  4px 14px rgba(0,0,0,0.90),
    inset 0  2px  5px rgba(0,0,0,0.65),
    inset 0 -1px  3px rgba(255,255,255,0.025),
    inset 0  0    0 1px rgba(255,255,255,0.03);

  --lip-in-gold:
    inset 0  4px 14px rgba(0,0,0,0.90),
    inset 0  2px  5px rgba(0,0,0,0.65),
    inset 0 -1px  3px rgba(255,255,255,0.025),
    inset 0  0    0 1px rgba(201,168,76,0.25),
    0 0 18px rgba(201,168,76,0.20);

  --pill-bg:        linear-gradient(160deg, #1c2038 0%, #111626 55%, #0d1020 100%);
  --pill-bg-active: linear-gradient(160deg, #0a0c16 0%, #0e1222 55%, #141930 100%);

  --accent:     #c9a84c;
  --accent-dim: rgba(201, 168, 76, 0.35);
  --text:       #d4cfc0;
  --text-dim:   #7a8ab0;
  --text-muted: #4a5470;
  --teal:       #4A7C6F;
  --purple:     #7B6FA0;
  --red:        #8B4040;

  --font-display: 'Cinzel', serif;
  --font-body:    'Lora', serif;
  --font-serif:   'Cormorant Garamond', serif;
}

/* ── Light theme ── */
[data-theme="light"] {
  --bg:         #f0e4c8;
  --bg-panel:   rgba(232, 216, 174, 0.82);
  --bg-card:    rgba(224, 208, 168, 0.88);
  --border:     rgba(130, 85, 28, 0.28);
  --border-lt:  rgba(130, 85, 28, 0.16);

  --glass-bg:     rgba(235, 220, 182, 0.80);
  --glass-border: rgba(255, 255, 255, 0.55);
  --glass-shine:  rgba(255, 255, 255, 0.40);

  --accent:     #7a5218;
  --accent-dim: rgba(122, 82, 24, 0.40);
  --text:       #2a1808;
  --text-dim:   #5a3f24;
  --text-muted: #8a7055;
  --teal:       #2f6b5a;
  --purple:     #5a4d80;
  --red:        #7a3030;

  /* Warm clay neumorphism — same shadow *structure* as dark, tuned for a light bg */
  --lip-out:
    0 4px 14px rgba(110,70,20,0.20),
    0 1px 4px  rgba(110,70,20,0.14),
    inset 0  1px 0 rgba(255,255,255,0.72),
    inset 0 -1px 0 rgba(110,70,20,0.18),
    inset 0  0   0 1px rgba(255,255,255,0.28);
  --lip-hover:
    0 5px 18px rgba(110,70,20,0.24),
    0 2px 6px  rgba(110,70,20,0.16),
    inset 0  1px 0 rgba(255,255,255,0.82),
    inset 0 -1px 0 rgba(110,70,20,0.22),
    inset 0  0   0 1px rgba(255,255,255,0.38),
    0 0 10px rgba(110,70,20,0.08);
  --lip-in:
    inset 0  3px 10px rgba(110,70,20,0.20),
    inset 0  1px  4px rgba(110,70,20,0.14),
    inset 0 -1px  2px rgba(255,255,255,0.65),
    inset 0  0    0 1px rgba(255,255,255,0.22);
  --lip-in-gold:
    inset 0  3px 10px rgba(110,70,20,0.20),
    inset 0  1px  4px rgba(110,70,20,0.14),
    inset 0 -1px  2px rgba(255,255,255,0.65),
    inset 0  0    0 1px rgba(130,85,28,0.35),
    0 0 12px rgba(130,85,28,0.14);

  --pill-bg:        linear-gradient(150deg, #ece0c0 0%, #e4d4a8 50%, #dccca0 100%);
  --pill-bg-active: linear-gradient(150deg, #d8cca0 0%, #e4d4a8 50%, #ece0c0 100%);
}
```

**Border-radius scale in practice** (no separate token — used as literals):
pills `12–14px`, cards/panels `8–10px`, resource-link rows `8px`, verse
callout `0 8px 8px 0` (square on the border side, rounded on the open side).

---

## 2. Component CSS

### Pill-shaped segmented nav (era nav)

```css
.era-nav {
  display: flex;
  gap: 6px;
  padding: 7px 16px;
  background: rgba(8,10,20,0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.era-nav__pill {
  padding: 4px 12px;
  border-radius: 14px;
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  background: var(--pill-bg);
  border: 1px solid rgba(201,168,76,0.10);
  color: rgba(201,168,76,0.45);
  cursor: pointer;
  box-shadow: var(--lip-out);
  transition: all 0.18s ease;
  white-space: nowrap;
}
.era-nav__pill:hover {
  border-color: rgba(201,168,76,0.35);
  color: var(--accent);
  box-shadow: var(--lip-hover);
}
.era-nav__pill--active {
  background: var(--pill-bg-active);
  border-color: rgba(201,168,76,0.45);
  color: var(--accent);
  box-shadow: var(--lip-in-gold);
}

/* Light theme */
[data-theme="light"] .era-nav__pill {
  background: var(--pill-bg);
  border-color: rgba(130,85,28,0.14);
  color: rgba(90,58,22,0.50);
  box-shadow: var(--lip-out);
}
[data-theme="light"] .era-nav__pill:hover {
  border-color: rgba(130,85,28,0.38);
  color: var(--accent);
  box-shadow: var(--lip-hover);
}
[data-theme="light"] .era-nav__pill--active {
  background: var(--pill-bg-active);
  border-color: rgba(130,85,28,0.55);
  color: var(--accent);
  box-shadow: var(--lip-in-gold);
}
```

The pattern for ANY pill/segmented-button in this system: resting state uses
`--pill-bg` + `--lip-out`; hover swaps to `--lip-hover` + brightens the
border/text to `--accent`; active/selected swaps the *background* to
`--pill-bg-active` (a darker/inverted gradient — reads as "pressed in") and
the shadow to `--lip-in-gold` (inset, so it looks sunken rather than lifted).
That out→hover→in-gold three-state shadow swap is the whole trick.

### Glass side panel (detail panel)

```css
.detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 340px;
  height: 100%;
  background: linear-gradient(170deg, #141828 0%, #0d1020 60%, #0a0c18 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  /* Left-edge 3D lip: bright rim catch on the visible edge + drop into canvas */
  border-left: 1px solid rgba(255,255,255,0.07);
  box-shadow:
    -14px 0 48px rgba(0,0,0,0.65),
    -4px  0 12px rgba(0,0,0,0.45),
    inset  1px 0 0 rgba(255,255,255,0.10),  /* left rim specular */
    inset  2px 0 8px rgba(255,255,255,0.025), /* left face catch */
    inset -1px 0 0 rgba(0,0,0,0.30),          /* inner right depth */
    inset  0  1px 0 rgba(255,255,255,0.07);   /* top cap */
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  z-index: 40;
  padding: 24px 20px 32px;
}
.detail-panel.open { transform: translateX(0); }

@media (max-width: 700px) {
  .detail-panel { width: min(340px, calc(100% - 20px)); }
}

/* Light theme */
[data-theme="light"] .detail-panel {
  background: linear-gradient(170deg, #f0e4c8 0%, #e8d8b0 60%, #e0cca0 100%);
  border-left-color: rgba(130,85,28,0.16);
  box-shadow:
    -14px 0 48px rgba(110,70,20,0.14),
    -4px  0 12px rgba(110,70,20,0.10),
    inset  1px 0 0 rgba(255,255,255,0.65),
    inset  2px 0 8px rgba(255,255,255,0.18),
    inset -1px 0 0 rgba(110,70,20,0.10),
    inset  0  1px 0 rgba(255,255,255,0.55);
}
```

Panel is **always mounted**, toggled via `.open` class flipping
`transform: translateX()` — not `display`/mount-unmount — so the slide
transition always plays cleanly.

### Bordered italic pull-quote callout

```css
.detail-panel__verse {
  margin-top: 14px;
  padding: 12px 16px;
  border-left: 3px solid rgba(74,124,111,0.55);
  background: rgba(74,124,111,0.07);
  backdrop-filter: blur(6px);
  border-radius: 0 8px 8px 0;
  font-family: var(--font-serif);
  font-size: 14px;
  font-style: italic;
  color: var(--text);
  line-height: 1.65;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}

/* Light theme — only the tint needs to change, everything else is token-driven */
[data-theme="light"] .detail-panel__verse {
  background: rgba(50,100,80,0.06);
  border-left-color: rgba(47,107,90,0.55);
}
```

Same recipe used for the non-italic prose block above it:

```css
.detail-panel__theme {
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  color: var(--text);
  line-height: 1.5;
  margin-top: 12px;
}
[data-theme="light"] .detail-panel__theme { color: rgba(60,35,12,0.80); }
```

### "Explore further" arrow-link rows

```css
.detail-panel__resources { margin-top: 20px; }

.detail-panel__reslink {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--text);
  text-decoration: none;
  background: var(--pill-bg);
  box-shadow: var(--lip-out);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
}
.detail-panel__reslink:hover {
  border-color: rgba(201,168,76,0.5);
  box-shadow: var(--lip-hover);
  color: var(--accent);
}
.detail-panel__resarrow { opacity: 0.55; font-size: 12px; flex-shrink: 0; }

/* Left-edge color tag by link category — swap for whatever categories you need */
.detail-panel__reslink--app     { border-left: 3px solid var(--accent); }
.detail-panel__reslink--study   { border-left: 3px solid #9a7ec8; }
.detail-panel__reslink--library { border-left: 3px solid var(--teal); }
```

No light-theme override exists for `.detail-panel__reslink` at all — it's
100% token-driven (`var(--border)`, `var(--pill-bg)`, `var(--text)`,
`var(--lip-out)`), so it re-themes automatically for free. That's the goal
to aim for with new components: if you only reach for `var(--token)` you
don't have to hand-author a light-mode pass at all.

Markup shape (React, adapt freely):
```jsx
<a className="detail-panel__reslink detail-panel__reslink--app"
   href={url} target="_blank" rel="noopener noreferrer">
  <span>{label}</span>
  <span className="detail-panel__resarrow" aria-hidden="true">↗</span>
</a>
```

---

## 3. Theme toggle

**Mechanism:** a `data-theme` attribute on `<html>`, swapped in a `useEffect`
that also persists to `localStorage`. No CSS class approach, no separate
stylesheets — every themed rule in the CSS is either a bare `var(--token)`
(auto-switches) or an explicit `[data-theme="light"] .foo { ... }` override
sitting right after the dark-mode rule for the same selector.

```jsx
// App.jsx
const [theme, setTheme] = useState(() => localStorage.getItem('bt-theme') || 'dark');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('bt-theme', theme);
}, [theme]);

<ThemeToggle theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
```

You said pta-portfolio already does the same `[data-theme]` + `ThemeContext`
pattern — so this part is a non-issue, you're purely after the toggle
button's *look and feel* below, not the state mechanism.

**The toggle button itself** is a two-stage "press, then flip" interaction —
not an instant swap:

```jsx
// ThemeToggle.jsx
function handleClick() {
  setPressed(true);                 // 1. squash down immediately
  setTimeout(() => {
    onToggle();                     // 2. flip the theme mid-press, 140ms later
    setTimeout(() => setPressed(false), 400); // 3. spring back up, 400ms after that
  }, 140);
}
```

That stagger is what sells it — the knob physically compresses, the theme
swaps while it's "in the dark" at the bottom of the press, then it springs
back up already in the new theme. Visually it reads like a real toggle
switch being thumbed, not a CSS class flip.

Full CSS (a 3D "capsule" toggle — track + recessed groove + sliding knob
with moon/sun icons that cross-fade, plus an ambient ferry glow that fades
in around the whole thing in light mode):

```css
.tt-wrap { flex-shrink: 0; position: relative; perspective: 600px; }

/* Ambient glow — only visible in light mode, fades in over 1.2s */
.tt-glow-wide, .tt-glow-mid, .tt-glow-core {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 1.2s ease;
}
.tt-wrap--light .tt-glow-wide,
.tt-wrap--light .tt-glow-mid,
.tt-wrap--light .tt-glow-core { opacity: 1; }
.tt-glow-wide {
  inset: -40px -50px;
  background: radial-gradient(ellipse at 52% 50%, rgba(255,220,160,0.20) 0%, transparent 65%);
  filter: blur(20px);
}
.tt-glow-mid {
  inset: -18px -22px;
  background: radial-gradient(ellipse at 52% 52%, rgba(255,228,170,0.30) 0%, transparent 60%);
  filter: blur(10px);
}
.tt-glow-core {
  inset: -4px -6px;
  background: radial-gradient(ellipse at 52% 55%, rgba(255,236,190,0.38) 0%, transparent 65%);
  filter: blur(4px);
}

.tt {
  position: relative;
  display: block;
  width: 58px;
  height: 26px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transform: perspective(600px) rotateX(7deg);
  transform-style: preserve-3d;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tt:hover    { transform: perspective(600px) rotateX(4deg) rotateY(-1deg) scale(1.04); }
.tt--pressed { transform: perspective(600px) rotateX(1deg) scale(0.97) !important; }

.tt-track {
  position: absolute;
  inset: 0;
  border-radius: 13px;
  background: linear-gradient(150deg, #1e1e24 0%, #131317 40%, #0c0c0f 100%);
  box-shadow:
    inset 0 3px 10px rgba(0,0,0,0.85),
    inset 0 -1px 3px rgba(255,255,255,0.025),
    0 10px 36px rgba(0,0,0,0.7),
    0 3px 8px rgba(0,0,0,0.45);
  transition: background 0.8s ease, box-shadow 0.8s ease;
}
.tt--light .tt-track {
  background: linear-gradient(150deg, #e8dcbf 0%, #ddd0a8 40%, #d0c298 100%);
  box-shadow:
    inset 0 2px 8px rgba(110,70,20,0.18),
    inset 0 -3px 8px rgba(255,248,230,0.70),
    0 10px 36px rgba(110,70,20,0.10),
    0 3px 8px rgba(110,70,20,0.06),
    0 0 60px rgba(255,220,150,0.08);
}

.tt-recess {
  position: absolute;
  inset: 13% 4.5%;
  border-radius: 9px;
  background: linear-gradient(180deg, #060608 0%, #0c0c10 50%, #090909 100%);
  box-shadow: inset 0 4px 16px rgba(0,0,0,0.95), inset 0 -1px 3px rgba(255,255,255,0.01);
  transition: background 0.8s ease, box-shadow 0.8s ease;
}
.tt--light .tt-recess {
  background: linear-gradient(180deg, #a89060 0%, #b8a070 50%, #c8b080 100%);
  box-shadow: inset 0 4px 16px rgba(80,50,10,0.30), inset 0 -2px 8px rgba(255,230,170,0.35);
}

.tt-floor-glow {
  position: absolute;
  bottom: 9%; left: 8%; right: 8%; height: 10%;
  border-radius: 4px;
  opacity: 0;
  background: linear-gradient(90deg, transparent 3%, rgba(255,218,140,0.5) 25%, rgba(255,228,170,0.75) 50%, rgba(255,218,140,0.5) 75%, transparent 97%);
  filter: blur(3px);
  transition: opacity 0.9s ease;
}
.tt--light .tt-floor-glow { opacity: 0.65; }

.tt-rim {
  position: absolute; inset: 0;
  border-radius: 13px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
  pointer-events: none;
  transition: box-shadow 0.8s ease;
}
.tt--light .tt-rim { box-shadow: inset 0 0 0 1px rgba(255,245,220,0.30); }

.tt-knob {
  position: absolute;
  top: 13%; left: 5%; width: 42%; bottom: 13%;
  border-radius: 8px;
  background: linear-gradient(150deg, #303036 0%, #252428 35%, #1b1a1e 100%);
  box-shadow:
    0 6px 20px rgba(0,0,0,0.7),
    0 2px 6px rgba(0,0,0,0.5),
    inset 0 1px 3px rgba(255,255,255,0.045),
    inset 0 -2px 4px rgba(0,0,0,0.4);
  transition:
    left 0.5s cubic-bezier(0.34, 1.3, 0.64, 1),
    background 0.8s ease,
    box-shadow 0.8s ease;
}
.tt--light .tt-knob {
  left: 53%;
  background: linear-gradient(150deg, #f5eddb 0%, #ede0c4 35%, #e4d4ae 100%);
  box-shadow:
    0 6px 22px rgba(110,70,20,0.18),
    0 2px 7px rgba(110,70,20,0.12),
    inset 0 3px 6px rgba(255,248,230,0.90),
    inset 0 -2px 5px rgba(110,70,20,0.08),
    0 0 30px rgba(255,218,140,0.08);
}
.tt--pressed .tt-knob { transform: translateY(1.5px); }

.tt-knob-spec {
  position: absolute; inset: 0;
  border-radius: 8px;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(0,0,0,0.12) 100%);
  transition: background 0.8s ease;
}
.tt--light .tt-knob-spec {
  background: linear-gradient(135deg, rgba(255,252,242,0.72) 0%, transparent 40%, rgba(110,70,20,0.02) 100%);
}

.tt-icon {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  opacity: 0;
  transform: scale(0.4) rotate(120deg);
  transition: opacity 0.6s ease, transform 0.6s ease;
  pointer-events: none;
}
.tt-icon--visible { opacity: 1; transform: scale(1) rotate(0deg); }

.tt-shadow {
  position: absolute;
  bottom: -5px; left: 10%; right: 10%; height: 8px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  filter: blur(8px);
  pointer-events: none;
  opacity: 0.6;
  transition: opacity 0.8s ease, background 0.8s ease;
}
.tt-wrap--light .tt-shadow { background: rgba(100,65,20,0.12); opacity: 0.5; }
```

Full JSX is in `src/components/ThemeToggle.jsx` in this repo if you want the
exact moon/sun SVG icon markup (inline, ~10 lines each, trivial to swap for
whatever icon set the portfolio uses).

---

## 4. Font stack

`Cinzel` (display/uppercase labels, nav pills) / `Cormorant Garamond`
(italic prose, pull-quotes) / `Lora` (body text) — loaded via Google Fonts
`<link>` in `index.html`, no `@font-face` self-hosting. This differs from
Playfair Display / DM Sans / Space Mono, so decide per-component whether you
want the Bible Timeline's serif-heavy voice or to keep your portfolio's
existing stack — the CSS above has zero hard dependency on these specific
families, every rule just references `var(--font-display)` /
`var(--font-serif)` / `var(--font-body)`, so re-pointing those three
variables at Playfair/DM Sans/Space Mono is a one-line-per-token change.
