import { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: SearchableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((option) =>
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
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          className={`w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
          }`}
          placeholder={placeholder || 'Search...'}
          value={isOpen ? searchTerm : value}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchTerm(value || '');
            }
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
        />
        {value && !isOpen && !disabled && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
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

      {isOpen && !disabled && (
        <ul className="absolute z-10 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg dark:shadow-slate-950/50">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">
              No results
            </li>
          ) : (
            filtered.map((option) => {
              const isSelected = option === value;
              return (
                <li
                  key={option}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(option);
                    setSearchTerm('');
                    setIsOpen(false);
                  }}
                >
                  {option}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}