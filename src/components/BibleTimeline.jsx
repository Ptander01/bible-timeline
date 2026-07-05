import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';

export const GENRE_COLORS = {
  Law:      '#8B2020',  // deep burgundy
  History:  '#1E4080',  // navy
  Wisdom:   '#8B6418',  // dark amber
  Poetry:   '#4A2480',  // deep indigo
  Prophecy: '#1A5C3A',  // pine green
  Gospel:   '#1A6B35',  // forest green
  Epistle:  '#3A1F70',  // deep violet
};

const ERA_FILL_DARK = {
  primeval:         'rgba(42,26,58,0.35)',
  patriarchal:      'rgba(26,42,58,0.35)',
  exodus:           'rgba(26,58,42,0.35)',
  united:           'rgba(58,42,26,0.35)',
  divided:          'rgba(58,26,26,0.35)',
  exile:            'rgba(26,26,58,0.35)',
  intertestamental: 'rgba(42,42,26,0.35)',
  kingdom:          'rgba(26,58,26,0.35)',
  church:           'rgba(58,26,42,0.35)',
};

const ERA_FILL_LIGHT = {
  primeval:         'rgba(110,60,130,0.07)',
  patriarchal:      'rgba(50,80,120,0.07)',
  exodus:           'rgba(40,100,70,0.07)',
  united:           'rgba(120,80,30,0.07)',
  divided:          'rgba(130,50,50,0.07)',
  exile:            'rgba(50,50,120,0.07)',
  intertestamental: 'rgba(100,90,30,0.07)',
  kingdom:          'rgba(30,100,40,0.07)',
  church:           'rgba(130,40,80,0.07)',
};

function yearLabel(y) {
  if (y <= 0) return `${Math.abs(y)} BC`;
  return `AD ${y}`;
}

function formatDateRange([s, e]) {
  if (s === e) return yearLabel(s);
  return `${yearLabel(s)} – ${yearLabel(e)}`;
}

const GROUP_COLOR = {
  patriarchs: '#c9a84c',
  judges:     '#9a7ec8',
  kings:      '#c4a06b',
  prophets:   '#4A7C6F',
  apostles:   '#5aaa70',
};

// Minimap era slice color: reuse the era band hue at higher alpha so slices read at 22px tall
function mmEraFill(eraId, isDark) {
  const src = (isDark ? ERA_FILL_DARK : ERA_FILL_LIGHT)[eraId];
  if (!src) return isDark ? 'rgba(80,80,110,0.6)' : 'rgba(120,100,60,0.35)';
  return src.replace(/[\d.]+\)$/, isDark ? '0.75)' : '0.40)');
}

// Coarse-pointer (touch) devices get larger hit targets
const IS_COARSE = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
const EVT_HIT_R = IS_COARSE ? 15 : 10;
const HIT_PAD   = IS_COARSE ? 5 : 0;

export default function BibleTimeline({ data, onSelectBook, onSelectEvent, selectedId, onZoomReady, onJumpReady, visibleLayers, searchQuery, onPanEra, onPanStart, theme }) {
  const svgRef   = useRef(null);
  const gRef     = useRef(null);
  const zoomRef  = useRef(null);
  const kRef     = useRef(1);
  const selectedIdRef = useRef(null); // mirror of selectedId for D3 event closures
  const mmViewRef = useRef(null);     // minimap viewport window rect
  const mmDragRef = useRef(false);    // true while scrubbing the minimap
  const [hoveredTip, setHoveredTip] = useState(null); // { label, sub, x, y }


  const W = 4000;  // logical SVG width — we zoom/pan within this
  const H_TOTAL = 560;

  // Layout constants (in logical px, scale-independent)
  const MARGIN_L  = 60;
  const MARGIN_R  = 60;
  const AXIS_Y    = 280;   // central axis
  const ERA_H     = 270;   // era bands fill almost full height (y=10 to y=550)
  const OT_BOOK_Y = 120;   // OT books row center (above figures)
  const NT_BOOK_Y = 430;   // NT books row center (below axis)
  const BOOK_H    = 18;
  const EVENT_TOP = 36;    // events above OT books
  const EVENT_BOT = 490;   // events below NT books
  const FIG_Y     = 210;   // patriarchs / figures between OT books and axis
  const FIG_H     = 10;
  const KING_H    = 12;   // height of each king reign bar
  const KING_ISRAEL_Y = 228;  // top of Israel track
  const KING_JUDAH_Y  = 244;  // top of Judah track
  const PROPH_H       = 8;    // height of each prophet bar
  const PROPH_MAJOR_Y = 259;  // top of major prophet row
  const PROPH_MINOR_Y = 270;  // top of minor prophet row

  const DOMAIN_START = -4100;
  const DOMAIN_END   = 100;

  // Minimap logical dimensions
  const MM_W = 220;
  const MM_H = 22;
  const mmX = (year) => (year - DOMAIN_START) / (DOMAIN_END - DOMAIN_START) * MM_W;

  const xScale = d3.scaleLinear()
    .domain([DOMAIN_START, DOMAIN_END])
    .range([MARGIN_L, W - MARGIN_R]);

  useEffect(() => {
    if (!svgRef.current || !data) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Theme-aware color scheme
    const isDark = theme !== 'light';
    const CS = {
      eraFill:         isDark ? ERA_FILL_DARK : ERA_FILL_LIGHT,
      eraDivider:      isDark ? 'rgba(201,168,76,0.15)'   : 'rgba(140,90,28,0.20)',
      axis:            isDark ? 'rgba(201,168,76,0.25)'   : 'rgba(140,90,28,0.30)',
      tickStroke:      isDark ? 'rgba(201,168,76,0.2)'    : 'rgba(140,90,28,0.22)',
      tickText:        isDark ? 'rgba(122,138,176,0.7)'   : 'rgba(90,58,20,0.65)',
      eraLabel:        isDark ? 'rgba(201,168,76,0.35)'   : 'rgba(120,75,22,0.58)',
      zoneDivider:     isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.07)',
      sectionOT:       isDark ? 'rgba(201,168,76,0.5)'    : 'rgba(110,68,18,0.65)',
      sectionPeople:   isDark ? 'rgba(201,168,76,0.4)'    : 'rgba(110,68,18,0.55)',
      sectionNT:       isDark ? 'rgba(74,124,111,0.6)'    : 'rgba(35,85,65,0.65)',
      prophTrack:      isDark ? '#a09060aa'               : 'rgba(100,65,18,0.65)',
      kingTrackLabel:  (col)  => isDark ? col + 'aa'      : col,
      evtMajor:        isDark ? '#c9a84c'                 : '#7a5218',
      evtMinor:        isDark ? 'rgba(122,138,176,0.7)'   : 'rgba(90,72,48,0.65)',
    };

    // Defs: glow filter + per-genre book-capsule gradients
    const defs = svg.append('defs');
    defs.append('filter').attr('id', 'glow')
      .append('feGaussianBlur').attr('stdDeviation', 2.5).attr('result', 'blur');
    const feMerge = defs.select('#glow').append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // (book capsule gradients replaced by inline CSS on foreignObject divs)

    // Root group for zoom
    const root = svg.append('g').attr('class', 'root');
    gRef.current = root.node();

    // ── Era bands ──
    const eraG = root.append('g').attr('class', 'eras');
    data.eras.forEach(era => {
      const x1 = xScale(era.start);
      const x2 = xScale(era.end);
      eraG.append('rect')
        .attr('x', x1).attr('y', AXIS_Y - ERA_H)
        .attr('width', x2 - x1).attr('height', ERA_H * 2)
        .attr('fill', CS.eraFill[era.id] || (isDark ? 'rgba(40,40,60,0.3)' : 'rgba(100,80,40,0.06)'))
        .attr('rx', 0);

      // Era divider lines
      if (era.id !== 'primeval') {
        eraG.append('line')
          .attr('x1', x1).attr('x2', x1)
          .attr('y1', AXIS_Y - ERA_H).attr('y2', AXIS_Y + ERA_H)
          .attr('stroke', CS.eraDivider).attr('stroke-width', 1);
      }
    });

    // ── Central axis ──
    root.append('line')
      .attr('class', 'axis-line')
      .attr('x1', MARGIN_L).attr('x2', W - MARGIN_R)
      .attr('y1', AXIS_Y).attr('y2', AXIS_Y)
      .attr('stroke', CS.axis).attr('stroke-width', 1);

    // ── Year ticks — adaptive ──
    const ticksG = root.append('g').attr('class', 'ticks');
    // We'll redraw ticks on zoom; store ref
    function drawTicks(k) {
      ticksG.selectAll('*').remove();
      // pick interval based on zoom
      let interval = 500;
      if (k > 0.5)  interval = 200;
      if (k > 1.2)  interval = 100;
      if (k > 2.5)  interval = 50;
      if (k > 6)    interval = 25;
      if (k > 12)   interval = 10;

      const start = Math.ceil(DOMAIN_START / interval) * interval;
      const ticks = [];
      for (let y = start; y <= DOMAIN_END; y += interval) ticks.push(y);

      ticks.forEach(y => {
        const x = xScale(y);
        ticksG.append('line')
          .attr('x1', x).attr('x2', x)
          .attr('y1', AXIS_Y - 6).attr('y2', AXIS_Y + 6)
          .attr('stroke', CS.tickStroke).attr('stroke-width', 0.5);
        ticksG.append('text')
          .attr('x', x).attr('y', AXIS_Y + 18)
          .attr('text-anchor', 'middle')
          .attr('fill', CS.tickText)
          .attr('font-family', "'Cinzel', serif")
          .attr('font-size', 9)
          .text(yearLabel(y));
      });
    }
    drawTicks(1);

    // ── Era labels (above each band) ──
    const eraLabelG = root.append('g').attr('class', 'era-labels');
    data.eras.forEach(era => {
      const x1 = xScale(era.start);
      const x2 = xScale(era.end);
      const cx = (x1 + x2) / 2;
      eraLabelG.append('text')
        .attr('class', 'era-label-text')
        .attr('data-era', era.id)
        .attr('x', cx)
        .attr('y', AXIS_Y - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', CS.eraLabel)
        .attr('font-family', "'Cinzel', serif")
        .attr('font-size', 11)
        .attr('letter-spacing', 2)
        .text(era.label.toUpperCase());
    });

    // ── Zone dividers (subtle horizontal rules between swim lanes) ──
    const dividerG = root.append('g').attr('class', 'zone-dividers');
    [190, 290].forEach(y => {
      dividerG.append('line')
        .attr('class', 'zone-divider')
        .attr('x1', MARGIN_L).attr('x2', W - MARGIN_R)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', CS.zoneDivider)
        .attr('stroke-width', 1)
        .attr('pointer-events', 'none');
    });

    // ── Lane labels — sticky left rail (outside root, y-only tracks zoom) ──
    const labelsOverlay = svg.append('g').attr('class', 'labels-overlay').attr('pointer-events', 'none');
    const dimEvt = isDark ? 'rgba(122,138,176,0.38)' : 'rgba(80,55,20,0.32)';
    [
      { text: 'EVENTS',   dataY: EVENT_TOP,  fill: dimEvt },
      { text: 'OT BOOKS', dataY: OT_BOOK_Y,  fill: CS.sectionOT },
      { text: 'FIGURES',  dataY: (FIG_Y + PROPH_MINOR_Y + PROPH_H) / 2, fill: CS.sectionPeople },
      { text: 'NT BOOKS', dataY: NT_BOOK_Y,  fill: CS.sectionNT },
    ].forEach(({ text, dataY, fill }) => {
      labelsOverlay.append('text')
        .attr('class', 'lane-label')
        .attr('data-y', dataY)
        .attr('x', 6)
        .attr('y', 0)
        .attr('text-anchor', 'start')
        .attr('fill', fill)
        .attr('font-family', "'Cinzel', serif")
        .attr('font-size', 7)
        .attr('letter-spacing', 2)
        .attr('opacity', 0.85)
        .text(text);
    });

    // ── Track pill helper (figures / kings / prophets) ──
    // Same CSS structure as book pills but semi-transparent so they read as data tracks.
    function makeTrackFO(parent, x, y, w, h, hex, { rx = 3, alpha = 0.40, labelClass, fontSize = 7, labelText = '' } = {}) {
      const cr = parseInt(hex.slice(1,3),16), cg = parseInt(hex.slice(3,5),16), cb = parseInt(hex.slice(5,7),16);
      const rL = Math.min(255,cr+35), gL = Math.min(255,cg+35), bL = Math.min(255,cb+35);
      const rD = Math.max(0,cr-18),   gD = Math.max(0,cg-18),   bD = Math.max(0,cb-18);
      const aT = Math.min(1, alpha + 0.08);
      const aM = alpha;
      const aB = Math.max(0, alpha - 0.06);
      const bg = `linear-gradient(160deg,rgba(${rL},${gL},${bL},${aT}) 0%,rgba(${cr},${cg},${cb},${aM}) 45%,rgba(${rD},${gD},${bD},${aB}) 100%)`;
      const outerDrop = isDark
        ? '0 2px 8px rgba(0,0,0,0.45),0 1px 2px rgba(0,0,0,0.28)'
        : '0 1px 5px rgba(50,28,8,0.20),0 1px 1px rgba(50,28,8,0.12)';
      const shadow = `${outerDrop},inset 0 1px 0 rgba(255,255,255,0.20),inset 0 -1px 0 rgba(0,0,0,0.26),inset 0 0 0 1px rgba(255,255,255,0.07)`;
      const SHPAD = 8;
      const fo = parent.append('foreignObject')
        .attr('x', x - SHPAD).attr('y', y - SHPAD)
        .attr('width', w + SHPAD * 2).attr('height', h + SHPAD * 2)
        .attr('pointer-events', 'none');
      fo.append('xhtml:div')
        .style('width', `${w}px`).style('height', `${h}px`)
        .style('margin', `${SHPAD}px 0 0 ${SHPAD}px`)
        .style('border-radius', `${rx}px`)
        .style('background', bg)
        .style('box-shadow', shadow)
        .style('box-sizing', 'border-box')
        .style('display', 'flex').style('align-items', 'center').style('justify-content', 'center')
        .style('overflow', 'hidden').style('pointer-events', 'none')
        .append('xhtml:span')
          .attr('class', labelClass)
          .style('font-family', "'Cinzel', serif")
          .style('font-size', `${fontSize / kRef.current}px`)
          .style('color', 'rgba(255,255,255,0.80)')
          .style('letter-spacing', '0.5px')
          .style('white-space', 'nowrap')
          .style('pointer-events', 'none')
          .text(labelText);
      return fo;
    }

    // ── Figures ──
    const figG = root.append('g').attr('class', 'figures');
    // Greedy row-pack so overlapping figures don't stack
    const figRows = [];
    const sortedFigs = [...data.figures].sort((a, b) => a.start - b.start);
    sortedFigs.forEach(fig => {
      const x1 = xScale(fig.start);
      const x2 = Math.max(x1 + 2, xScale(fig.end));
      let row = figRows.findIndex(r => r <= x1 - 4);
      if (row === -1) { figRows.push(0); row = figRows.length - 1; }
      figRows[row] = x2;
      const color = GROUP_COLOR[fig.group] || '#c9a84c';
      const fy = FIG_Y + row * (FIG_H + 3);
      const fw = Math.max(4, x2 - x1);
      const fg = figG.append('g')
        .attr('class', 'fig-group')
        .attr('data-name', fig.name.toLowerCase());
      makeTrackFO(fg, x1, fy - FIG_H / 2, fw, FIG_H, color,
        { rx: FIG_H / 2, alpha: 0.42, labelClass: 'fig-pill-label', fontSize: 7, labelText: fig.name });
      // transparent hit rect
      fg.append('rect')
        .attr('x', x1).attr('y', fy - FIG_H / 2 - HIT_PAD)
        .attr('width', fw).attr('height', FIG_H + HIT_PAD * 2)
        .attr('fill', 'transparent').attr('rx', FIG_H / 2).attr('stroke', 'none');
    });

    // ── Kings of Israel & Judah ──
    const ISRAEL_COLOR = '#6b9ec4';
    const JUDAH_COLOR  = '#c4a06b';

    function renderKings(kings, trackY, color, kingdom) {
      const g = root.append('g').attr('class', `kings kings-${kingdom.toLowerCase()}`);

      // Track label pinned at left edge of divided era
      g.append('text')
        .attr('class', 'king-track-label')
        .attr('x', xScale(-932) - 4)
        .attr('y', trackY + KING_H / 2 + 3)
        .attr('text-anchor', 'end')
        .attr('fill', CS.kingTrackLabel(color))
        .attr('font-family', "'Cinzel', serif")
        .attr('font-size', 7)
        .attr('letter-spacing', 1)
        .text(kingdom.toUpperCase());

      kings.forEach(king => {
        const x1 = xScale(king.start);
        const x2 = xScale(king.end);
        const w  = Math.max(x2 - x1, 1);
        const kg = g.append('g')
          .attr('class', 'king-group')
          .attr('data-name', king.name.toLowerCase())
          .attr('cursor', 'pointer')
          .on('click', (e) => {
            e.stopPropagation();
            onSelectEvent && onSelectEvent({
              id: `${kingdom}-${king.name}`,
              label: king.name,
              year: king.start,
              endYear: king.end,
              eraId: 'divided',
              kingdom,
              type: 'king',
            });
          })
          .on('mouseover', function(event) {
            d3.select(this).select('div').style('filter', 'brightness(1.22)');
            setHoveredTip({ label: king.name, sub: `${yearLabel(king.start)} – ${yearLabel(king.end)}`, x: event.clientX + 14, y: event.clientY - 36 });
          })
          .on('mouseout', function() {
            d3.select(this).select('div').style('filter', null);
            setHoveredTip(null);
          });

        makeTrackFO(kg, x1, trackY, w, KING_H, color,
          { rx: 3, alpha: 0.45, labelClass: 'king-pill-label', fontSize: 7, labelText: king.name });
        // transparent hit rect
        kg.append('rect')
          .attr('x', x1).attr('y', trackY - HIT_PAD)
          .attr('width', w).attr('height', KING_H + HIT_PAD * 2)
          .attr('fill', 'transparent').attr('rx', 3).attr('stroke', 'none');
      });
    }

    renderKings(data.kingsIsrael, KING_ISRAEL_Y, ISRAEL_COLOR, 'Israel');
    renderKings(data.kingsJudah,  KING_JUDAH_Y,  JUDAH_COLOR,  'Judah');

    // ── Prophets ──
    const MAJOR_PROPHETS = new Set(['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel']);
    const PROPH_MAJOR_COLOR = '#c9a84c';
    const PROPH_MINOR_COLOR = '#7a9e8a';

    const prophets = data.books.filter(b => b.genre === 'Prophecy' && b.testament === 'OT');
    const prophG = root.append('g').attr('class', 'prophets');

    // Single shared label anchored at start of divided era
    prophG.append('text')
      .attr('class', 'proph-track-label')
      .attr('x', xScale(-932) - 4)
      .attr('y', (PROPH_MAJOR_Y + PROPH_MINOR_Y) / 2 + PROPH_H / 2 + 1)
      .attr('text-anchor', 'end')
      .attr('fill', CS.prophTrack)
      .attr('font-family', "'Cinzel', serif")
      .attr('font-size', 7)
      .attr('letter-spacing', 1)
      .text('PROPHETS');

    prophets.forEach(book => {
      const isMajor = MAJOR_PROPHETS.has(book.name);
      const color   = isMajor ? PROPH_MAJOR_COLOR : PROPH_MINOR_COLOR;
      const trackY  = isMajor ? PROPH_MAJOR_Y : PROPH_MINOR_Y;
      const x1 = xScale(book.dateRange[0]);
      const x2 = Math.max(x1 + 3, xScale(book.dateRange[1]));
      const w  = x2 - x1;

      const pg = prophG.append('g')
        .attr('class', 'proph-group')
        .attr('data-name', `${book.name.toLowerCase()} ${(book.abbrev || '').toLowerCase()}`)
        .attr('cursor', 'pointer')
        .on('click', (e) => { e.stopPropagation(); onSelectBook && onSelectBook(book); })
        .on('mouseover', function(event) {
          d3.select(this).select('div').style('filter', 'brightness(1.22)');
          setHoveredTip({ label: book.name, sub: formatDateRange(book.dateRange), x: event.clientX + 14, y: event.clientY - 36 });
        })
        .on('mouseout', function() {
          d3.select(this).select('div').style('filter', null);
          setHoveredTip(null);
        });

      makeTrackFO(pg, x1, trackY, w, PROPH_H, color,
        { rx: 3, alpha: 0.42, labelClass: 'proph-pill-label', fontSize: 6, labelText: book.abbrev || book.name });
      // transparent hit rect
      pg.append('rect')
        .attr('x', x1).attr('y', trackY - HIT_PAD)
        .attr('width', w).attr('height', PROPH_H + HIT_PAD * 2)
        .attr('fill', 'transparent').attr('rx', 3).attr('stroke', 'none');
    });

    // ── Books ──
    const bookG = root.append('g').attr('class', 'books');

    // Multi-row layout to prevent overlap within OT / NT
    function layoutBooks(books, centerY) {
      const rows = [];
      const sorted = [...books].sort((a, b) => a.dateRange[0] - b.dateRange[0]);
      sorted.forEach(book => {
        const x1 = xScale(book.dateRange[0]);
        const x2 = Math.max(x1 + 28, xScale(book.dateRange[1]));
        let placed = false;
        for (let r = 0; r < rows.length; r++) {
          const last = rows[r][rows[r].length - 1];
          if (last._x2 + 2 <= x1) {
            rows[r].push({ ...book, _x1: x1, _x2: x2, _row: r });
            placed = true;
            break;
          }
        }
        if (!placed) rows.push([{ ...book, _x1: x1, _x2: x2, _row: rows.length }]);
      });
      const rowH = BOOK_H + 4;
      const totalH = rows.length * rowH;
      rows.forEach((row, ri) => {
        const y = centerY - totalH / 2 + ri * rowH;
        row.forEach(book => {
          const color = GENRE_COLORS[book.genre] || '#7a8ab0';
          const g = bookG.append('g')
            .attr('class', 'book-capsule')
            .attr('data-id', book.id)
            .attr('data-name', `${book.name.toLowerCase()} ${(book.abbrev || '').toLowerCase()}`)
            .attr('cursor', 'pointer')
            .on('click', (e) => { e.stopPropagation(); onSelectBook && onSelectBook(book); })
            .on('mouseenter', function() {
              d3.select(this).select('div').style('filter', 'brightness(1.22)');
            })
            .on('mouseleave', function() {
              const isSel = d3.select(this).attr('data-id') === selectedIdRef.current;
              d3.select(this).select('div').style('filter', isSel ? 'brightness(1.25) saturate(1.1)' : null);
            });

          const rx = BOOK_H / 2;
          const w  = book._x2 - book._x1;

          // Compute color variants for CSS gradient
          const cr = parseInt(color.slice(1,3),16);
          const cgv = parseInt(color.slice(3,5),16);
          const cb = parseInt(color.slice(5,7),16);
          const rL = Math.min(255,cr+40), gL = Math.min(255,cgv+40), bL = Math.min(255,cb+40);
          const rD = Math.max(0,cr-20),   gD = Math.max(0,cgv-20),   bD = Math.max(0,cb-20);
          const bgGrad = `linear-gradient(160deg,rgb(${rL},${gL},${bL}) 0%,rgb(${cr},${cgv},${cb}) 45%,rgb(${rD},${gD},${bD}) 100%)`;
          const outerDrop = isDark
            ? '0 3px 10px rgba(0,0,0,0.58),0 1px 3px rgba(0,0,0,0.40)'
            : '0 2px 7px rgba(50,28,8,0.28),0 1px 2px rgba(50,28,8,0.16)';
          const pillShadow = `${outerDrop},inset 0 1px 0 rgba(255,255,255,0.22),inset 0 -1px 0 rgba(0,0,0,0.38),inset 0 0 0 1px rgba(255,255,255,0.08)`;

          // foreignObject → real HTML div with exact same CSS as filter pills, just genre colors
          const SHPAD = 12;
          const fo = g.append('foreignObject')
            .attr('x', book._x1 - SHPAD).attr('y', y - SHPAD)
            .attr('width', w + SHPAD * 2).attr('height', BOOK_H + SHPAD * 2)
            .attr('pointer-events', 'none');

          fo.append('xhtml:div')
            .style('width', `${w}px`)
            .style('height', `${BOOK_H}px`)
            .style('margin', `${SHPAD}px 0 0 ${SHPAD}px`)
            .style('border-radius', `${rx}px`)
            .style('background', bgGrad)
            .style('box-shadow', pillShadow)
            .style('box-sizing', 'border-box')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('overflow', 'hidden')
            .style('pointer-events', 'none')
            .append('xhtml:span')
              .attr('class', 'book-pill-label')
              .style('font-family', "'Cinzel', serif")
              .style('font-size', `${7.5 / kRef.current}px`)
              .style('color', 'rgba(255,255,255,0.88)')
              .style('letter-spacing', '0.5px')
              .style('white-space', 'nowrap')
              .style('pointer-events', 'none')
              .text(book.abbrev);

          // Transparent hit rect — provides click + hover target for the g handlers
          g.append('rect')
            .attr('x', book._x1).attr('y', y)
            .attr('width', w).attr('height', BOOK_H)
            .attr('fill', 'transparent')
            .attr('rx', rx)
            .attr('stroke', 'none');
        });
      });
    }

    const otBooks = data.books.filter(b => b.testament === 'OT');
    const ntBooks = data.books.filter(b => b.testament === 'NT');
    layoutBooks(otBooks, OT_BOOK_Y);
    layoutBooks(ntBooks, NT_BOOK_Y);

    // ── Events ──
    const evtG = root.append('g').attr('class', 'events');
    const evtLabels = []; // metadata for screen-space label collision in the zoom handler
    // Alternate events above/below the axis to reduce label overlap
    let aboveIdx = 0, belowIdx = 0;
    data.events.forEach((evt, i) => {
      const x = xScale(evt.year);
      const isMajor = evt.type === 'major';
      const goAbove = i % 2 === 0;
      const evtY = goAbove
        ? EVENT_TOP + (aboveIdx % 4) * 14
        : EVENT_BOT + (belowIdx % 3) * 14;
      if (goAbove) aboveIdx++; else belowIdx++;

      const color = isMajor ? CS.evtMajor : CS.evtMinor;

      // per-event group so search dimming can target the whole event
      const eg = evtG.append('g')
        .attr('class', 'evt-group')
        .attr('data-name', evt.label.toLowerCase());

      // connector line to axis
      eg.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', AXIS_Y).attr('y2', evtY)
        .attr('stroke', color).attr('stroke-width', isMajor ? 0.8 : 0.4)
        .attr('stroke-dasharray', isMajor ? null : '2,3')
        .attr('opacity', 0.5);

      // dot
      eg.append('circle')
        .attr('cx', x).attr('cy', evtY)
        .attr('r', isMajor ? 4 : 2.5)
        .attr('fill', color)
        .attr('opacity', isMajor ? 0.9 : 0.6)
        .attr('pointer-events', 'none');

      // invisible larger hit target (scaled in zoom handler to stay ~10px screen)
      eg.append('circle')
        .attr('class', 'evt-hit')
        .attr('cx', x).attr('cy', evtY)
        .attr('r', EVT_HIT_R)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('click', (e) => { e.stopPropagation(); onSelectEvent && onSelectEvent(evt); })
        .on('mouseover', function(event) {
          d3.select(this.previousSibling).attr('opacity', 1).attr('r', isMajor ? 5.5 : 4);
          setHoveredTip({ label: evt.label, sub: yearLabel(evt.year), x: event.clientX + 14, y: event.clientY - 36 });
        })
        .on('mouseout', function() {
          d3.select(this.previousSibling).attr('opacity', isMajor ? 0.9 : 0.6).attr('r', isMajor ? 4 : 2.5);
          setHoveredTip(null);
        });

      // label — visibility managed by collision pass in the zoom handler
      const labelSel = eg.append('text')
        .attr('class', 'evt-label')
        .attr('data-major', isMajor)
        .attr('x', x)
        .attr('y', evtY - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-family', "'Cinzel', serif")
        .attr('font-size', isMajor ? 8.5 : 7)
        .attr('pointer-events', 'none')
        .text(evt.label);

      evtLabels.push({
        node: labelSel.node(),
        x,
        row: evtY,
        above: evtY < AXIS_Y,
        major: isMajor,
        // approx rendered width: labels hold constant screen size (fontSize/k)
        w: evt.label.length * (isMajor ? 8.5 : 7) * 0.66,
      });
    });

    // Greedy screen-space collision: majors placed first, then minors left-to-right.
    // When rows are squeezed together (screen row gap < label height) treat each
    // side of the axis as a single lane so vertically-overlapping rows don't clash.
    function layoutEventLabels(t) {
      const k = t.k;
      const mergeRows = 14 * k < 10;
      const kept = new Map(); // laneKey -> [[x1,x2], …]
      const ordered = [...evtLabels].sort((a, b) =>
        a.major === b.major ? a.x - b.x : (a.major ? -1 : 1));
      ordered.forEach(L => {
        let show = k >= 0.2 && (L.major || k >= 0.4);
        if (show) {
          const lane = mergeRows ? (L.above ? 'above' : 'below') : L.row;
          const sx = t.applyX(L.x);
          const x1 = sx - L.w / 2 - 4;
          const x2 = sx + L.w / 2 + 4;
          const intervals = kept.get(lane) || [];
          if (intervals.some(([a, b]) => x1 < b && x2 > a)) show = false;
          else { intervals.push([x1, x2]); kept.set(lane, intervals); }
        }
        L.node.setAttribute('display', show ? '' : 'none');
      });
    }
    layoutEventLabels(d3.zoomIdentity);

    // ── Zoom behavior ──
    const zoom = d3.zoom()
      .scaleExtent([0.08, 30])
      // Disable built-in wheel handling — we implement it ourselves below
      // so vertical scroll zooms and horizontal scroll pans.
      .filter(event => event.type !== 'wheel' && !event.button)
      .on('zoom', (e) => {
        const t = e.transform;
        root.attr('transform', t);
        const k = t.k;
        kRef.current = k;

        // scale-invariant font sizes
        svg.selectAll('.era-label-text').attr('font-size', 11 / k);
        svg.selectAll('.evt-label').attr('font-size', function() {
          const maj = d3.select(this).attr('data-major') === 'true';
          return (maj ? 8.5 : 7) / k;
        });
        svg.selectAll('.ticks text').attr('font-size', 9 / k);
        svg.selectAll('.ticks line').attr('stroke-width', 0.5 / k);
        svg.selectAll('.axis-line').attr('stroke-width', 1 / k);
        svg.selectAll('.book-pill-label').style('font-size', `${7.5 / k}px`);
        svg.selectAll('.fig-pill-label').style('font-size', `${7 / k}px`).style('display', k < 0.8 ? 'none' : null);
        svg.selectAll('.evt-hit').attr('r', EVT_HIT_R / k);
        svg.selectAll('.king-pill-label').style('font-size', `${7 / k}px`).style('display', k < 1.5 ? 'none' : null);
        svg.selectAll('.king-track-label').attr('font-size', 7 / k);
        // Lane labels live outside root — update y-position only
        svg.selectAll('.lane-label').attr('y', function() {
          return t.applyY(+d3.select(this).attr('data-y')) + 4;
        });
        svg.selectAll('.zone-divider').attr('stroke-width', 1 / k);
        svg.selectAll('.proph-pill-label').style('font-size', `${6 / k}px`).style('display', k < 2 ? 'none' : null);
        svg.selectAll('.proph-track-label').attr('font-size', 7 / k);

        // event label visibility: zoom thresholds + screen-space collision
        layoutEventLabels(t);

        drawTicks(k);
        svg.selectAll('.ticks text').attr('font-size', 9 / k);
        svg.selectAll('.ticks line').attr('stroke-width', 0.5 / k);

        // Era indicator: find which era the viewport center is over
        if (onPanEra && svgRef.current) {
          const svgW = svgRef.current.clientWidth || 1280;
          const centerYear = xScale.invert((svgW / 2 - t.x) / k);
          const era = data.eras.find(er => centerYear >= er.start && centerYear <= er.end);
          if (era) onPanEra(era.id);
        }

        // Minimap viewport window tracks the visible year range
        if (mmViewRef.current && svgRef.current) {
          const svgW = svgRef.current.clientWidth || 1280;
          const frac = (yr) => Math.max(0, Math.min(1, (yr - DOMAIN_START) / (DOMAIN_END - DOMAIN_START)));
          const px1 = frac(xScale.invert(-t.x / k)) * MM_W;
          const px2 = frac(xScale.invert((svgW - t.x) / k)) * MM_W;
          mmViewRef.current.setAttribute('x', px1);
          mmViewRef.current.setAttribute('width', Math.max(4, px2 - px1));
        }
      });

    // Fire onPanStart when user begins dragging so auto-era can resume
    zoom.on('start', (e) => {
      if (e.sourceEvent && e.sourceEvent.type === 'mousedown') onPanStart?.();
    });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Custom wheel handler: vertical scroll → zoom, horizontal scroll → pan
    svg.on('wheel.custom', function(event) {
      event.preventDefault();
      const cur = d3.zoomTransform(this);
      const [px, py] = d3.pointer(event, this);
      const lineH = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? 400 : 1;
      const dy = event.deltaY * lineH;
      const dx = event.deltaX * lineH;

      // Zoom centered on cursor from vertical scroll
      const newK = Math.max(0.08, Math.min(30, cur.k * Math.exp(-dy * 0.004)));
      // Pan horizontally from horizontal scroll, zoom-centered on cursor
      const newX = px - (px - cur.x) * (newK / cur.k) - dx;
      const newY = py - (py - cur.y) * (newK / cur.k);

      d3.select(this).call(zoom.transform, d3.zoomIdentity.translate(newX, newY).scale(newK));
    }, { passive: false });

    // ── Search jump: zoom/pan to the first match for a query ──
    function findMatch(q) {
      const candidates = [];
      data.books.forEach(b => candidates.push({
        name: `${b.name} ${b.abbrev || ''} ${b.id}`.toLowerCase(),
        range: b.dateRange,
        y: b.testament === 'OT' ? OT_BOOK_Y : NT_BOOK_Y,
      }));
      data.figures.forEach(f => candidates.push({
        name: f.name.toLowerCase(), range: [f.start, f.end], y: FIG_Y,
      }));
      data.kingsIsrael.forEach(kg => candidates.push({
        name: kg.name.toLowerCase(), range: [kg.start, kg.end], y: KING_ISRAEL_Y,
      }));
      data.kingsJudah.forEach(kg => candidates.push({
        name: kg.name.toLowerCase(), range: [kg.start, kg.end], y: KING_JUDAH_Y,
      }));
      data.events.forEach(ev => candidates.push({
        name: ev.label.toLowerCase(), range: [ev.year, ev.year], y: AXIS_Y,
      }));
      return candidates.find(c => c.name.startsWith(q))
          || candidates.find(c => c.name.includes(q));
    }

    function jumpToMatch(q) {
      q = (q || '').trim().toLowerCase();
      const svgEl = svgRef.current;
      if (!q || !svgEl) return;
      const hit = findMatch(q);
      if (!hit) return;
      const svgW = svgEl.clientWidth || 1280;
      const svgH = Math.max(200, svgEl.clientHeight || 600);
      const cur = d3.zoomTransform(svgEl);
      const x1 = xScale(hit.range[0]);
      const x2 = xScale(hit.range[1]);
      const spanW = Math.max(x2 - x1, 30);
      const targetK = Math.min(8, Math.max(cur.k, 1.4, (svgW * 0.4) / spanW));
      const tx = svgW / 2 - ((x1 + x2) / 2) * targetK;
      const ty = svgH / 2 - hit.y * targetK;
      animateZoom(svgEl, d3.zoomIdentity.translate(tx, ty).scale(targetK), 500);
    }
    if (onJumpReady) onJumpReady(jumpToMatch);

    // Register zoomToEra with parent after zoom is ready
    if (onZoomReady) {
      onZoomReady((era) => {
        const svgEl = svgRef.current;
        if (!svgEl) return;
        const rect = svgEl.getBoundingClientRect();
        const svgW = svgEl.clientWidth  || rect.width  || svgEl.parentElement?.clientWidth  || 1280;
        const svgH = Math.max(200, svgEl.clientHeight || rect.height || svgEl.parentElement?.clientHeight || 600);
        const x1 = xScale(era.start);
        const x2 = xScale(era.end);
        const eraW = x2 - x1;
        const targetScale = Math.min(8, Math.max(0.08, (svgW * 0.88) / eraW));
        const tx = svgW / 2 - ((x1 + x2) / 2) * targetScale;
        const ty = (svgH - H_TOTAL * targetScale) / 2;
        animateZoom(svgEl, d3.zoomIdentity.translate(tx, ty).scale(targetScale));
      });
    }

    // Defer initial transform until after browser layout so clientHeight is real
    setTimeout(() => {
      const svgEl = svgRef.current;
      if (!svgEl) return;
      // Re-render (e.g. theme change): keep the user's position — re-applying
      // the existing transform also re-runs zoom styling on the fresh nodes
      const existing = d3.zoomTransform(svgEl);
      if (existing.k !== 1 || existing.x !== 0 || existing.y !== 0) {
        d3.select(svgEl).call(zoom.transform, existing);
        return;
      }
      const svgW = svgEl.clientWidth  || 1280;
      const svgH = Math.max(200, svgEl.clientHeight || 600);
      const initScale = (svgH - 20) / H_TOTAL;
      const centerYear = -2000;
      const centerX = xScale(centerYear) * initScale;
      const tx = svgW / 2 - centerX;
      const ty = (svgH - H_TOTAL * initScale) / 2;
      d3.select(svgEl).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initScale));
    }, 0);

  }, [data, theme]);

  // Highlight selected book — gold ring on the hit rect + brightness lift on the pill div
  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!gRef.current) return;
    d3.select(gRef.current).selectAll('.book-capsule').each(function() {
      const g = d3.select(this);
      const isSel = g.attr('data-id') === selectedId;
      g.select('rect')
        .attr('stroke', isSel ? '#c9a84c' : 'none')
        .attr('stroke-width', isSel ? 2 : 0)
        .attr('vector-effect', 'non-scaling-stroke');
      g.select('div').style('filter', isSel ? 'brightness(1.25) saturate(1.1)' : null);
    });
  }, [selectedId, theme]);

  // Search: highlight matching elements, dim everything else
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) {
      svg.selectAll('.book-capsule, .fig-group, .king-group, .proph-group, .evt-group')
        .attr('opacity', null);
      return;
    }
    function matchByName() {
      const id = d3.select(this).attr('data-id') || '';
      const name = d3.select(this).attr('data-name') || '';
      return (id.includes(q) || name.includes(q)) ? 1 : 0.12;
    }
    svg.selectAll('.book-capsule').attr('opacity', matchByName);
    svg.selectAll('.fig-group').attr('opacity', matchByName);
    svg.selectAll('.king-group').attr('opacity', matchByName);
    svg.selectAll('.proph-group').attr('opacity', matchByName);
    svg.selectAll('.evt-group').attr('opacity', matchByName);
  }, [searchQuery]);

  // Toggle layer visibility without re-rendering D3
  useEffect(() => {
    if (!svgRef.current || !visibleLayers) return;
    const svg = d3.select(svgRef.current);
    svg.select('.figures').attr('display', visibleLayers.people   ? null : 'none');
    svg.select('.events').attr('display',  visibleLayers.events   ? null : 'none');
    svg.select('.books').attr('display',   visibleLayers.books    ? null : 'none');
    svg.selectAll('.kings').attr('display',   visibleLayers.kings    ? null : 'none');
    svg.select('.prophets').attr('display', visibleLayers.prophets ? null : 'none');
  }, [visibleLayers]);

  function animateZoom(svgEl, target, dur = 400) {
    const z = zoomRef.current;
    if (!z) return;
    const from = d3.zoomTransform(svgEl);
    const startMs = Date.now();
    function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
    function step() {
      const p = ease(Math.min((Date.now() - startMs) / dur, 1));
      const t = d3.zoomIdentity
        .translate(from.x + (target.x - from.x) * p, from.y + (target.y - from.y) * p)
        .scale(from.k + (target.k - from.k) * p);
      d3.select(svgEl).call(z.transform, t);
      if (p < 1) setTimeout(step, 16);
    }
    step();
  }

  const handleZoom = useCallback((factor) => {
    const svgEl = svgRef.current;
    const z = zoomRef.current;
    if (!svgEl || !z) return;
    const cur = d3.zoomTransform(svgEl);
    const newK = Math.min(30, Math.max(0.08, cur.k * factor));
    const svgW = svgEl.clientWidth;
    const svgH = svgEl.clientHeight;
    const cx = svgW / 2;
    const cy = svgH / 2;
    const tx = cx - (cx - cur.x) * (newK / cur.k);
    const ty = cy - (cy - cur.y) * (newK / cur.k);
    animateZoom(svgEl, d3.zoomIdentity.translate(tx, ty).scale(newK), 300);
  }, []);

  const handleReset = useCallback(() => {
    const svgEl = svgRef.current;
    const svgW = svgEl.clientWidth  || 1280;
    const svgH = Math.max(200, svgEl.clientHeight || 600);
    const initScale = (svgH - 20) / H_TOTAL;
    const centerYear = -2000;
    const centerX = xScale(centerYear) * initScale;
    const tx = svgW / 2 - centerX;
    const ty = (svgH - H_TOTAL * initScale) / 2;
    animateZoom(svgEl, d3.zoomIdentity.translate(tx, ty).scale(initScale), 500);
  }, []);

  // Minimap scrub: center the main viewport on the clicked/dragged year, keeping zoom
  function mmJump(clientX, el) {
    const svgEl = svgRef.current;
    const z = zoomRef.current;
    if (!svgEl || !z) return;
    const rect = el.getBoundingClientRect();
    const fracX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const year = DOMAIN_START + fracX * (DOMAIN_END - DOMAIN_START);
    const cur = d3.zoomTransform(svgEl);
    const svgW = svgEl.clientWidth || 1280;
    const tx = svgW / 2 - xScale(year) * cur.k;
    d3.select(svgEl).call(z.transform, d3.zoomIdentity.translate(tx, cur.y).scale(cur.k));
  }

  // Keyboard navigation: ← → pan (Shift = faster), + − zoom, 0 fit
  useEffect(() => {
    function onKey(e) {
      if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      const svgEl = svgRef.current;
      const z = zoomRef.current;
      if (!svgEl || !z) return;
      const pan = (dx) => {
        onPanStart?.();
        const cur = d3.zoomTransform(svgEl);
        d3.select(svgEl).call(z.transform, d3.zoomIdentity.translate(cur.x + dx, cur.y).scale(cur.k));
      };
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); pan(e.shiftKey ? 400 : 120); break;
        case 'ArrowRight': e.preventDefault(); pan(e.shiftKey ? -400 : -120); break;
        case '+': case '=': e.preventDefault(); handleZoom(1.4); break;
        case '-': case '_': e.preventDefault(); handleZoom(1 / 1.4); break;
        case '0': e.preventDefault(); handleReset(); break;
        default: break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleZoom, handleReset, onPanStart]);

  return (
    <>
      <svg ref={svgRef} className="timeline-svg"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={() => handleZoom(2)} title="Zoom in (+)">+</button>
        <button className="zoom-btn" onClick={() => handleZoom(0.5)} title="Zoom out (−)">−</button>
        <button className="zoom-btn" onClick={handleReset} title="Reset (0)" style={{ fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>FIT</button>
      </div>
      <div
        className="minimap"
        title="Click or drag to navigate"
        onPointerDown={(e) => {
          mmDragRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          onPanStart?.();
          mmJump(e.clientX, e.currentTarget);
        }}
        onPointerMove={(e) => { if (mmDragRef.current) mmJump(e.clientX, e.currentTarget); }}
        onPointerUp={() => { mmDragRef.current = false; }}
        onPointerCancel={() => { mmDragRef.current = false; }}
      >
        <svg viewBox={`0 0 ${MM_W} ${MM_H}`} width={MM_W} height={MM_H} preserveAspectRatio="none">
          {data.eras.map(era => {
            const x1 = mmX(era.start);
            return (
              <rect key={era.id} x={x1} y={0} width={mmX(era.end) - x1} height={MM_H}
                fill={mmEraFill(era.id, theme !== 'light')} />
            );
          })}
          <line className="minimap__axis" x1={0} x2={MM_W} y1={MM_H / 2} y2={MM_H / 2} />
          <rect ref={mmViewRef} className="minimap__view" x={0} y={0.5} width={MM_W} height={MM_H - 1} rx={3} />
        </svg>
      </div>
      {hoveredTip && (
        <div className="tl-tooltip" style={{ left: hoveredTip.x, top: hoveredTip.y }}>
          <div className="tl-tooltip__label">{hoveredTip.label}</div>
          {hoveredTip.sub && <div className="tl-tooltip__sub">{hoveredTip.sub}</div>}
        </div>
      )}
    </>
  );
}
