const LAYERS = [
  { id: 'people',   label: 'People'   },
  { id: 'events',   label: 'Events'   },
  { id: 'books',    label: 'Books'    },
  { id: 'kings',    label: 'Kings'    },
  { id: 'prophets', label: 'Prophets' },
];

export default function FilterBar({ visible, onToggle, ntExpanded, onToggleNt }) {
  return (
    <div className="filter-bar">
      <span className="filter-bar__label">Show</span>
      {LAYERS.map(layer => (
        <button
          key={layer.id}
          className={`filter-bar__pill${visible[layer.id] ? ' filter-bar__pill--on' : ''}`}
          onClick={() => onToggle(layer.id)}
          title={visible[layer.id] ? `Hide ${layer.label}` : `Show ${layer.label}`}
        >
          <span className="filter-bar__dot" />
          {layer.label}
        </button>
      ))}
      <button
        className={`filter-bar__pill filter-bar__pill--nt${ntExpanded ? ' filter-bar__pill--on' : ''}`}
        onClick={onToggleNt}
        title={ntExpanded
          ? 'Restore the proportional time scale'
          : 'Stretch the New Testament era across the screen'}
      >
        <span className="filter-bar__dot" />
        {ntExpanded ? 'NT Expanded' : 'Expand NT'}
      </button>
    </div>
  );
}
