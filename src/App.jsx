import { useState, useRef, useCallback, useEffect } from 'react';
import BibleTimeline from './components/BibleTimeline';
import DetailPanel from './components/DetailPanel';
import EraNav from './components/EraNav';
import FilterBar from './components/FilterBar';
import GenreLegend from './components/GenreLegend';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import data from './data/bible-data.json';

const ALL_ON = { people: true, events: true, books: true, kings: true, prophets: true };

function readUrlParams() {
  const p = new URLSearchParams(window.location.search);
  return { eraId: p.get('era'), selId: p.get('sel') };
}

function writeUrlParams(eraId, selId) {
  const p = new URLSearchParams();
  if (eraId) p.set('era', eraId);
  if (selId) p.set('sel', selId);
  const str = p.toString();
  window.history.replaceState(null, '', str ? `?${str}` : window.location.pathname);
}

export default function App() {
  const [selected, setSelected]           = useState(null);
  const [activeEraId, setActiveEraId]     = useState(null);
  const [visibleLayers, setVisibleLayers] = useState(ALL_ON);
  const [searchQuery, setSearchQuery]     = useState('');
  const [theme, setTheme]                 = useState(() => localStorage.getItem('bt-theme') || 'dark');
  const zoomToEraFn   = useRef(null);
  const jumpToMatchFn = useRef(null);
  const userPickedEra = useRef(false); // true when user clicked a pill → don't auto-override
  const urlRestored   = useRef(false); // URL state is restored once on first mount only

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bt-theme', theme);
  }, [theme]);

  // Esc closes the detail panel (unless typing in an input, e.g. search)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) {
        setSelected(null);
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
    const { eraId, selId } = readUrlParams();
    if (eraId) {
      const era = data.eras.find(e => e.id === eraId);
      if (era) { setActiveEraId(eraId); fn(era); userPickedEra.current = true; }
    }
    if (selId) {
      const book = data.books.find(b => b.id === selId);
      if (book) setSelected({ item: book, type: 'book' });
    }
  }, []);

  // Sync URL whenever era or selection changes
  useEffect(() => {
    writeUrlParams(activeEraId, selected?.item?.id ?? null);
  }, [activeEraId, selected]);

  function handleEraSelect(era) {
    userPickedEra.current = true;
    setActiveEraId(era.id);
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
    const type = evt.type === 'king' ? 'king' : evt.type === 'prophet' ? 'book' : 'event';
    setSelected(prev =>
      prev?.item?.id === evt.id ? null : { item: evt, type }
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bible Timeline</h1>
        <span className="subtitle">ESV Chronological · ~4000 BC – AD 95</span>
        <SearchBar onSearch={setSearchQuery} onSubmit={(q) => jumpToMatchFn.current?.(q)} />
        <span className="hint">Scroll to zoom · drag to pan · click for details</span>
        <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      </header>

      <EraNav eras={data.eras} onSelect={handleEraSelect} activeEraId={activeEraId} />
      <FilterBar visible={visibleLayers} onToggle={handleToggleLayer} />

      <div className="timeline-container">
        <GenreLegend />
        <BibleTimeline
          data={data}
          onZoomReady={handleZoomReady}
          onJumpReady={(fn) => { jumpToMatchFn.current = fn; }}
          onSelectBook={handleSelectBook}
          onSelectEvent={handleSelectEvent}
          selectedId={selected?.item?.id}
          visibleLayers={visibleLayers}
          searchQuery={searchQuery}
          onPanEra={handlePanEra}
          onPanStart={handlePanStart}
          theme={theme}
        />
        <DetailPanel
          item={selected?.item}
          type={selected?.type}
          onClose={() => setSelected(null)}
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
