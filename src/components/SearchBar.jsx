import { useState, useRef } from 'react';

export default function SearchBar({ onSearch, onSubmit, matchCount, jumpIndex }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    onSearch(q.trim().toLowerCase());
  }

  function handleClear() {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      onSubmit?.(query.trim().toLowerCase(), e.shiftKey ? -1 : 1);
    } else if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    }
  }

  return (
    <div className="search-bar">
      <svg className="search-bar__icon" viewBox="0 0 16 16" fill="none">
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
        <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <input
        ref={inputRef}
        className="search-bar__input"
        type="text"
        placeholder="Search books, people, events…"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {query && matchCount != null && (
        <span
          className={`search-bar__count${matchCount === 0 ? ' search-bar__count--none' : ''}`}
          title={matchCount > 0 ? 'Enter: next match · Shift+Enter: previous' : 'No matches'}
        >
          {matchCount === 0
            ? 'no matches'
            : jumpIndex != null
              ? `${jumpIndex + 1}/${matchCount} ↵`
              : `${matchCount} ↵`}
        </span>
      )}
      {query && (
        <button className="search-bar__clear" onClick={handleClear} aria-label="Clear">×</button>
      )}
    </div>
  );
}
