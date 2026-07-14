import { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchableDropdown({ options, value, onChange, placeholder }: SearchableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder || 'Search...'}
          value={isOpen ? searchTerm : value}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm(value || '');
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
        />
        {value && !isOpen && (
          <button
            className="absolute right-2 top-2 text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchTerm('');
            }}
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-gray-400">No results</li>
          ) : (
            filtered.map((option) => (
              <li
                key={option}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                  option === value ? 'bg-blue-100' : ''
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();  // prevent blur
                  onChange(option);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}