import data from '../data/bible-data.json';
import { resourcesFor } from '../resources';
import { GROUP_COLOR } from '../genreColors';

function yearLabel(y) {
  if (y <= 0) return `${Math.abs(y)} BC`;
  return `AD ${y}`;
}

function formatDateRange([s, e]) {
  if (s === e) return yearLabel(s);
  return `${yearLabel(s)} – ${yearLabel(e)}`;
}

const GROUP_LABEL = {
  patriarchs: 'Patriarch', exodus: 'Leader', judges: 'Judge', kings: 'King',
  prophets: 'Prophet', apostles: 'Apostle',
};

// Per-person title overrides where the group label would be theologically off
// (Jesus and John the Baptist sit in the 'apostles' group for coloring only).
const FIGURE_TITLE = { jesus: 'Messiah', 'john-baptist': 'Forerunner' };

function ExploreLinks({ item, type }) {
  const links = resourcesFor(item, type);
  if (!links.length) return null;
  return (
    <div className="detail-panel__resources">
      <div className="detail-panel__label">Explore Further</div>
      {links.map(r => (
        <a key={r.url} className={`detail-panel__reslink detail-panel__reslink--${r.kind}`}
          href={r.url} target="_blank" rel="noopener noreferrer">
          <span>{r.label}</span>
          <span className="detail-panel__resarrow" aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

export default function DetailPanel({ item, type, onClose }) {
  const open = !!item;

  const eraName = item
    ? (data.eras.find(e => e.id === item.eraId)?.label ?? '')
    : '';

  return (
    <div className={`detail-panel${open ? ' open' : ''}`}>
      <button className="detail-panel__close" onClick={onClose}>×</button>

      {item && type === 'book' && (
        <>
          <div className="detail-panel__abbrev">{item.abbrev}</div>
          <div className="detail-panel__name">{item.name}</div>
          <div className="detail-panel__badges">
            <span className={`detail-panel__badge detail-panel__badge--${item.testament.toLowerCase()}`}>
              {item.testament === 'OT' ? 'Old Testament' : 'New Testament'}
            </span>
            <span className="detail-panel__badge detail-panel__badge--genre">{item.genre}</span>
          </div>

          <hr className="detail-panel__divider" />

          <div className="detail-panel__section">
            <div className="detail-panel__label">Dates Written</div>
            <div className="detail-panel__value">{formatDateRange(item.dateRange)}</div>
          </div>

          <div className="detail-panel__section">
            <div className="detail-panel__label">Era</div>
            <div className="detail-panel__value">{eraName}</div>
          </div>

          <div className="detail-panel__section">
            <div className="detail-panel__label">Author</div>
            <div className="detail-panel__value">{item.author}</div>
          </div>

          <hr className="detail-panel__divider" />

          <div className="detail-panel__theme">{item.theme}</div>

          <div className="detail-panel__verse">{item.keyVerse}</div>

          <ExploreLinks item={item} type={type} />
        </>
      )}

      {item && type === 'figure' && (
        <>
          <div className="detail-panel__abbrev">{FIGURE_TITLE[item.id] ?? GROUP_LABEL[item.group] ?? 'Figure'}</div>
          <div className="detail-panel__name" style={{ color: GROUP_COLOR[item.group] }}>
            {item.name}
          </div>

          <hr className="detail-panel__divider" />

          <div className="detail-panel__section">
            <div className="detail-panel__label">Timeframe</div>
            <div className="detail-panel__value">{formatDateRange([item.start, item.end])}</div>
          </div>

          <ExploreLinks item={item} type={type} />
        </>
      )}

      {item && type === 'event' && (
        <>
          <div className="detail-panel__abbrev">{eraName}</div>
          <div className="detail-panel__name">{item.label}</div>

          <hr className="detail-panel__divider" />

          <div className="detail-panel__section">
            <div className="detail-panel__label">Date</div>
            <div className="detail-panel__value">
              {item.endYear
                ? `${yearLabel(item.year)} – ${yearLabel(item.endYear)}`
                : yearLabel(item.year)}
            </div>
          </div>

          <div className="detail-panel__section">
            <div className="detail-panel__label">Era</div>
            <div className="detail-panel__value">{eraName}</div>
          </div>

          <ExploreLinks item={item} type={type} />
        </>
      )}

      {item && type === 'context' && (
        <>
          <div className="detail-panel__abbrev">
            {item.category === 'age' ? 'Historical Age'
              : item.category === 'power' ? 'Empire & Power'
              : 'Way of Life'}
          </div>
          <div className="detail-panel__name">{item.name}</div>
          <div className="detail-panel__badges">
            <span className="detail-panel__badge detail-panel__badge--context">{item.region}</span>
          </div>

          <hr className="detail-panel__divider" />

          <div className="detail-panel__section">
            <div className="detail-panel__label">Period</div>
            <div className="detail-panel__value">{formatDateRange([item.start, item.end])}</div>
          </div>

          <hr className="detail-panel__divider" />

          <div className="detail-panel__prose">{item.description}</div>
          <div className="detail-panel__note">Dates are approximate, following common scholarly convention.</div>
        </>
      )}

      {item && type === 'king' && (
        <>
          <div className="detail-panel__abbrev">
            {item.kingdom === 'Israel' ? 'Northern Kingdom' : 'Southern Kingdom'}
          </div>
          <div className="detail-panel__name"
            style={{ color: item.kingdom === 'Israel' ? '#6b9ec4' : '#c4a06b' }}>
            {item.label}
          </div>
          <div className="detail-panel__badges">
            <span className="detail-panel__badge"
              style={{ borderColor: item.kingdom === 'Israel' ? '#6b9ec4' : '#c4a06b',
                       color: item.kingdom === 'Israel' ? '#6b9ec4' : '#c4a06b' }}>
              {item.kingdom === 'Israel' ? 'Israel' : 'Judah'}
            </span>
          </div>

          <hr className="detail-panel__divider" />

          <div className="detail-panel__section">
            <div className="detail-panel__label">Reign</div>
            <div className="detail-panel__value">
              {yearLabel(item.year)} – {yearLabel(item.endYear)}
              <span style={{ color: 'var(--text-dim)', marginLeft: 8, fontSize: 11 }}>
                ({Math.abs(item.endYear - item.year)} yrs)
              </span>
            </div>
          </div>

          <div className="detail-panel__section">
            <div className="detail-panel__label">Capital</div>
            <div className="detail-panel__value">
              {item.kingdom === 'Israel' ? 'Samaria' : 'Jerusalem'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
