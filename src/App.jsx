import { useState, useRef, useCallback } from 'react';
import BibleTimeline from './components/BibleTimeline';
import DetailPanel from './components/DetailPanel';
import EraNav from './components/EraNav';
import FilterBar from './components/FilterBar';
import GenreLegend from './components/GenreLegend';
import data from './data/bible-data.json';

const ALL_ON = { people: true, events: true, books: true, kings: true, prophets: true };

export default function App() {
  const [selected, setSelected]         = useState(null);
  const [activeEraId, setActiveEraId]   = useState(null);
  const [visibleLayers, setVisibleLayers] = useState(ALL_ON);
  const zoomToEraFn = useRef(null);

  const handleZoomReady = useCallback((fn) => { zoomToEraFn.current = fn; }, []);

  function handleEraSelect(era) {
    setActiveEraId(era.id);
    zoomToEraFn.current?.(era);
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
    const type = evt.type === 'king' ? 'king' : 'event';
    setSelected(prev =>
      prev?.item?.id === evt.id ? null : { item: evt, type }
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bible Timeline</h1>
        <span className="subtitle">ESV Chronological · ~4000 BC – AD 95</span>
        <span className="hint">Scroll to zoom · drag to pan · click a book or event for details</span>
      </header>

      <EraNav eras={data.eras} onSelect={handleEraSelect} activeEraId={activeEraId} />
      <FilterBar visible={visibleLayers} onToggle={handleToggleLayer} />

      <div className="timeline-container">
        <GenreLegend />
        <BibleTimeline
          data={data}
          onZoomReady={handleZoomReady}
          onSelectBook={handleSelectBook}
          onSelectEvent={handleSelectEvent}
          selectedId={selected?.item?.id}
          visibleLayers={visibleLayers}
        />
        <DetailPanel
          item={selected?.item}
          type={selected?.type}
          onClose={() => setSelected(null)}
        />
      </div>

      <div className="era-legend">
        {data.eras.map(era => (
          <div key={era.id} className="era-legend-item" title={era.label}>
            {era.shortLabel}
          </div>
        ))}
      </div>
    </div>
  );
}
