import { GENRE_COLORS } from './BibleTimeline';

export default function GenreLegend() {
  return (
    <div className="genre-legend">
      {Object.entries(GENRE_COLORS).map(([genre, color]) => (
        <div key={genre} className="genre-legend__item">
          <span className="genre-legend__swatch" style={{ background: color }} />
          <span className="genre-legend__label">{genre}</span>
        </div>
      ))}
    </div>
  );
}
