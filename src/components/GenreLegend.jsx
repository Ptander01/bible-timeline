import { GENRE_COLORS, GROUP_COLOR } from '../genreColors';

export default function GenreLegend() {
  return (
    <div className="genre-legend">
      <div className="genre-legend__title">Book Genre</div>
      {Object.entries(GENRE_COLORS).map(([genre, color]) => (
        <div key={genre} className="genre-legend__item">
          <span className="genre-legend__swatch" style={{ background: color }} />
          <span className="genre-legend__label">{genre}</span>
        </div>
      ))}
      <div className="genre-legend__title genre-legend__title--people">People</div>
      {Object.entries(GROUP_COLOR).map(([group, color]) => (
        <div key={group} className="genre-legend__item">
          <span className="genre-legend__swatch genre-legend__swatch--pill" style={{ background: color }} />
          <span className="genre-legend__label">{group}</span>
        </div>
      ))}
    </div>
  );
}
