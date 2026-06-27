export default function EraNav({ eras, onSelect, activeEraId }) {
  return (
    <div className="era-nav">
      {eras.map(era => (
        <button
          key={era.id}
          className={`era-nav__pill${activeEraId === era.id ? ' era-nav__pill--active' : ''}`}
          onClick={() => onSelect(era)}
          title={era.label}
        >
          {era.shortLabel}
        </button>
      ))}
    </div>
  );
}
