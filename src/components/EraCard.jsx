function yearLabel(y) {
  if (y <= 0) return `${Math.abs(y)} BC`;
  return `AD ${y}`;
}

function formatDateRange(s, e) {
  return `${yearLabel(s)} – ${yearLabel(e)}`;
}

export default function EraCard({ era, onClose }) {
  if (!era) return null;
  return (
    <div className="era-card" key={era.id}>
      <button className="era-card__close" onClick={onClose} aria-label="Close">×</button>
      <div className="era-card__eyebrow">Era</div>
      <div className="era-card__name">{era.label}</div>
      <div className="era-card__range">{formatDateRange(era.start, era.end)}</div>
      <p className="era-card__desc">{era.description}</p>
    </div>
  );
}
