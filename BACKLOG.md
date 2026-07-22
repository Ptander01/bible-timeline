# Bible Timeline — Backlog

Ideas captured for future work, not yet started.

## Splash / hero landing page
A cinematic full-viewport intro shown on first load (like Paul's World's
`LandingSplash`): title card ("Bible Timeline"), a short evocative subtitle,
maybe a scripture line, and an "Enter" button that reveals the timeline.
- Consider a layered/parallax background or a faint animated timeline motif.
- One-time per page load (no persistence needed), matching the Paul's World pattern.
- Should respect the parchment/dark theme.

## Slick load / draw animations
Make the timeline feel alive when it first draws and when layers/filters toggle.
- **On first load:** a left-to-right reveal — bars, dots, and flagpoles
  "wave" or bounce into place sequentially across the time axis (stagger by x
  position so it sweeps from 4000 BC → AD 100).
- **On filter on/off** (SHOW pills, legend filters, layer toggles): animate the
  affected lane in/out with the same left-to-right wave/bounce rather than an
  instant opacity swap.
- Candidate techniques: CSS keyframes with per-element `animation-delay` keyed
  to x position; or a d3 transition with staggered `delay(d => xScale(...) * k)`.
  Respect `prefers-reduced-motion` (fall back to a simple fade).
- Keep it tasteful — a subtle bounce/ease-out, not a long or distracting show.

## Other candidates (from the earlier improvement list)
- **Play mode** — a sweeping time marker with play/pause/speed that reveals
  items as it crosses their dates (the marquee "walk through history" feature).
- **Richer detail panel** — show contemporary events / "meanwhile" context.
