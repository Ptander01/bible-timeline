import { useState, useRef, useCallback, useEffect } from 'react';
import BibleTimeline from './components/BibleTimeline';
import DetailPanel from './components/DetailPanel';
import EraCard from './components/EraCard';
import EraNav from './components/EraNav';
import FilterBar from './components/FilterBar';
import GenreLegend from './components/GenreLegend';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import data from './data/bible-data.json';

const ALL_ON = { people: true, events: true, books: true, kings: true, prophets: true, context: true };
const LAYER_IDS = Object.keys(ALL_ON);

function readUrlParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    eraId: p.get('era'),
    selId: p.get('sel'),
    selType: p.get('selType'),
    nt: p.get('nt') === '1',
    filter: p.get('filter'), // "kind:value"
    hide: p.get('hide'),     // comma-separated layer ids that are OFF
  };
}

function writeUrlParams({ eraId, selId, selType, nt, legendFilter, visibleLayers }) {
  const p = new URLSearchParams();
  if (eraId) p.set('era', eraId);
  if (selId) { p.set('sel', selId); p.set('selType', selType); }
  if (nt) p.set('nt', '1');
  if (legendFilter) p.set('filter', `${legendFilter.kind}:${legendFilter.value}`);
  const hidden = LAYER_IDS.filter(id => visibleLayers[id] === false);
  if (hidden.length) p.set('hide', hidden.join(','));
  const str = p.toString();
  window.history.replaceState(null, '', str ? `?${str}` : window.location.pathname);
}

// Reconstruct a {item, type} selection from URL id/type — mirrors the shapes
// each canvas element passes to onSelectBook/onSelectEvent.
function resolveSelection(selType, selId) {
  if (!selType || !selId) return null;
  if (selType === 'book') {
    const book = data.books.find(b => b.id === selId);
    return book ? { item: book, type: 'book' } : null;
  }
  if (selType === 'event') {
    const evt = data.events.find(e => e.id === selId);
    return evt ? { item: evt, type: 'event' } : null;
  }
  if (selType === 'figure') {
    const fig = data.figures.find(f => f.id === selId);
    return fig ? { item: { ...fig, label: fig.name }, type: 'figure' } : null;
  }
  if (selType === 'context') {
    const ctx = data.worldContext?.find(c => c.id === selId);
    return ctx ? { item: { ...ctx, label: ctx.name }, type: 'context' } : null;
  }
  if (selType === 'king') {
    const [kingdom, ...rest] = selId.split('-');
    const name = rest.join('-');
    const list = kingdom === 'Israel' ? data.kingsIsrael : kingdom === 'Judah' ? data.kingsJudah : null;
    const king = list?.find(k => k.name === name);
    return king
      ? { item: { id: selId, label: king.name, year: king.start, endYear: king.end, eraId: 'divided', kingdom, type: 'king' }, type: 'king' }
      : null;
  }
  return null;
}

export default function App() {
  const [selected, setSelected]           = useState(null);
  const [activeEraId, setActiveEraId]     = useState(null);
  const [visibleLayers, setVisibleLayers] = useState(ALL_ON);
  const [searchQuery, setSearchQuery]     = useState('');
  const [matchCount, setMatchCount]       = useState(null);
  const [ntExpanded, setNtExpanded]       = useState(false);
  const [jumpIndex, setJumpIndex]         = useState(null);
  const [legendFilter, setLegendFilter]   = useState(null); // { kind:'genre'|'group', value } | null
  const [eraCardId, setEraCardId]         = useState(null); // era intro card shown after a deliberate era pick
  const [theme, setTheme]                 = useState(() => localStorage.getItem('bt-theme') || 'dark');
  const zoomToEraFn   = useRef(null);
  const jumpToMatchFn = useRef(null);
  const userPickedEra = useRef(false); // true when user clicked a pill → don't auto-override
  const urlRestored   = useRef(false); // URL state is restored once on first mount only

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bt-theme', theme);
  }, [theme]);

  // Esc closes the detail panel and era card (unless typing in an input, e.g. search)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) {
        setSelected(null);
        setEraCardId(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleZoomReady = useCallback((fn) => {
    zoomToEraFn.current = fn;
    // Restore URL state once zoom is ready — first mount only, not on
    // re-renders (e.g. theme change), which would re-zoom and fight the
    // preserved transform
    if (urlRestored.current) return;
    urlRestored.current = true;
    const { eraId, selId, selType, nt, filter, hide } = readUrlParams();
    if (eraId) {
      const era = data.eras.find(e => e.id === eraId);
      if (era) {
        // guard must be set before fn(era) — its very first animation frame
        // fires the pan-era listener synchronously, which would otherwise
        // stomp this restored era back to whatever's near the default center
        userPickedEra.current = true;
        setActiveEraId(eraId);
        setEraCardId(eraId);
        fn(era);
      }
    }
    const sel = resolveSelection(selType, selId);
    if (sel) setSelected(sel);
    if (nt) setNtExpanded(true);
    if (filter) {
      const [kind, ...rest] = filter.split(':');
      const value = rest.join(':');
      if ((kind === 'genre' || kind === 'group') && value) setLegendFilter({ kind, value });
    }
    if (hide) {
      const off = new Set(hide.split(','));
      setVisibleLayers(prev => {
        const next = { ...prev };
        LAYER_IDS.forEach(id => { if (off.has(id)) next[id] = false; });
        return next;
      });
    }
  }, []);

  // Sync the URL whenever any shareable view-state piece changes
  useEffect(() => {
    writeUrlParams({
      eraId: activeEraId,
      selId: selected?.item?.id ?? null,
      selType: selected?.type ?? null,
      nt: ntExpanded,
      legendFilter,
      visibleLayers,
    });
  }, [activeEraId, selected, ntExpanded, legendFilter, visibleLayers]);

  function handleEraSelect(era) {
    userPickedEra.current = true;
    setActiveEraId(era.id);
    setEraCardId(era.id);
    zoomToEraFn.current?.(era);
  }

  // Called by BibleTimeline as user pans — updates era indicator without overriding user clicks
  function handlePanEra(eraId) {
    if (!userPickedEra.current) setActiveEraId(eraId);
  }

  // After user pans manually, re-enable auto-era detection
  function handlePanStart() {
    userPickedEra.current = false;
  }

  function handleToggleLayer(id) {
    setVisibleLayers(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSelectBook(book) {
    setSelected(prev =>
      prev?.item?.id === book.id ? null : { item: book, type: 'book' }
    );
  }

  function handleSelectEvent(evt) {
    const type = evt.type === 'king' ? 'king'
      : evt.type === 'prophet' ? 'book'
      : evt.type === 'context' ? 'context'
      : evt.type === 'figure' ? 'figure'
      : 'event';
    setSelected(prev =>
      prev?.item?.id === evt.id ? null : { item: evt, type }
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bible Timeline</h1>
        <span className="subtitle">ESV Chronological · ~4000 BC – AD 95</span>
        <SearchBar
          onSearch={(q) => { setSearchQuery(q); setJumpIndex(null); }}
          onSubmit={(q, dir) => jumpToMatchFn.current?.(q, dir)}
          matchCount={matchCount}
          jumpIndex={jumpIndex}
        />
        <span className="hint">Scroll to zoom · drag to pan · click for details</span>
        <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      </header>

      <EraNav eras={data.eras} onSelect={handleEraSelect} activeEraId={activeEraId} />
      <FilterBar
        visible={visibleLayers}
        onToggle={handleToggleLayer}
        ntExpanded={ntExpanded}
        onToggleNt={() => setNtExpanded(v => !v)}
      />

      <div className="timeline-container">
        <GenreLegend
          activeFilter={legendFilter}
          onPick={(kind, value) => setLegendFilter(f =>
            f && f.kind === kind && f.value === value ? null : { kind, value })}
        />
        <BibleTimeline
          data={data}
          onZoomReady={handleZoomReady}
          onJumpReady={(fn) => { jumpToMatchFn.current = fn; }}
          onMatchCount={setMatchCount}
          onJumpIndex={setJumpIndex}
          onSelectBook={handleSelectBook}
          onSelectEvent={handleSelectEvent}
          selectedId={selected?.item?.id}
          visibleLayers={visibleLayers}
          searchQuery={searchQuery}
          onPanEra={handlePanEra}
          onPanStart={handlePanStart}
          theme={theme}
          ntExpanded={ntExpanded}
          legendFilter={legendFilter}
        />
        <DetailPanel
          item={selected?.item}
          type={selected?.type}
          onClose={() => setSelected(null)}
        />
        <EraCard
          era={data.eras.find(e => e.id === eraCardId) ?? null}
          onClose={() => setEraCardId(null)}
        />
      </div>

      <div className="era-legend">
        {data.eras.map(era => (
          <div
            key={era.id}
            className={`era-legend-item${activeEraId === era.id ? ' era-legend-item--active' : ''}`}
            title={era.label}
          >
            {era.shortLabel}
          </div>
        ))}
      </div>
    </div>
  );
}
