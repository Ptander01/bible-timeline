import { useState, useRef } from 'react';

export default function SearchBar({ onSearch }) {
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
      />
      {query && (
        <button className="search-bar__clear" onClick={handleClear} aria-label="Clear">×</button>
      )}
    </div>
  );
}
