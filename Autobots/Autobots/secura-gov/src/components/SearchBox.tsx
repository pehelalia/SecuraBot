import { useState, useRef, useEffect } from 'react';

interface SearchBoxProps {
  placeholder?: string;
  options: string[];
  onSelect?: (value: string) => void;
}

export default function SearchBox({ placeholder = 'Search resources...', options, onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query) {
      const f = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
      setFiltered(f);
      setShow(f.length > 0);
    } else {
      setFiltered([]);
      setShow(false);
    }
  }, [query, options]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (container.current && !container.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="position-relative" ref={container}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => query && setShow(filtered.length > 0)}
      />
      {show && (
        <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
          {filtered.map((opt, idx) => (
            <li
              key={idx}
              className="list-group-item list-group-item-action"
              onClick={() => {
                setQuery(opt);
                setShow(false);
                onSelect && onSelect(opt);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
