import { GENRE_COLORS, GROUP_COLOR } from '../genreColors';

// Display labels for the people groups (keys are the figure `group` values)
const PEOPLE_LABEL = {
  patriarchs: 'Patriarchs', exodus: 'Leaders', judges: 'Judges',
  kings: 'Kings', prophets: 'Prophets', apostles: 'Apostles',
};

export default function GenreLegend({ activeFilter, onPick }) {
  const isActive = (kind, value) => activeFilter?.kind === kind && activeFilter?.value === value;
  const dimmed = (kind, value) => activeFilter && !isActive(kind, value);

  return (
    <div className="genre-legend">
      <div className="genre-legend__title">Book Genre</div>
      {Object.entries(GENRE_COLORS).map(([genre, color]) => (
        <button
          key={genre}
          className={`genre-legend__item${isActive('genre', genre) ? ' genre-legend__item--active' : ''}${dimmed('genre', genre) ? ' genre-legend__item--dim' : ''}`}
          onClick={() => onPick('genre', genre)}
          title={`Show only ${genre} books`}
        >
          <span className="genre-legend__swatch" style={{ background: color }} />
          <span className="genre-legend__label">{genre}</span>
        </button>
      ))}
      <div className="genre-legend__title genre-legend__title--people">People</div>
      {Object.entries(GROUP_COLOR).map(([group, color]) => (
        <button
          key={group}
          className={`genre-legend__item${isActive('group', group) ? ' genre-legend__item--active' : ''}${dimmed('group', group) ? ' genre-legend__item--dim' : ''}`}
          onClick={() => onPick('group', group)}
          title={`Show only ${PEOPLE_LABEL[group] ?? group}`}
        >
          <span className="genre-legend__swatch genre-legend__swatch--pill" style={{ background: color }} />
          <span className="genre-legend__label">{PEOPLE_LABEL[group] ?? group}</span>
        </button>
      ))}
    </div>
  );
}
