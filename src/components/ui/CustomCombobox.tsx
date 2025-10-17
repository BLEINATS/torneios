import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, ChevronsUpDown } from 'lucide-react';

interface CustomComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomCombobox: React.FC<CustomComboboxProps> = ({ options, value, onChange, placeholder = "Buscar ou criar novo..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = query === ''
    ? options
    : options.filter(option =>
        option.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (option: string) => {
    onChange(option);
    setQuery('');
    setIsOpen(false);
  };

  const showCreateOption = query !== '' && !options.some(opt => opt.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative w-full" ref={comboboxRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full cursor-default rounded-md bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-yellow sm:text-sm sm:leading-6 h-10"
      >
        <span className="block truncate">{value || "Selecione um nível"}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            <div className="relative m-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="w-full rounded-md border-0 bg-gray-700 py-2 pl-10 pr-3 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-brand-yellow"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            <ul className="max-h-40 overflow-y-auto">
              {filteredOptions.map((option) => (
                <li
                  key={option}
                  className="relative cursor-default select-none py-2 pl-10 pr-4 text-white hover:bg-gray-700"
                  onClick={() => handleSelect(option)}
                >
                  <span className={`block truncate ${value === option ? 'font-medium' : 'font-normal'}`}>
                    {option}
                  </span>
                  {value === option ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-yellow">
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </li>
              ))}
              {showCreateOption && (
                 <li
                    className="relative cursor-default select-none py-2 pl-10 pr-4 text-white hover:bg-gray-700"
                    onClick={() => handleSelect(query)}
                 >
                    Criar: "<span className="font-bold">{query}</span>"
                 </li>
              )}
               {filteredOptions.length === 0 && !showCreateOption && (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                    Nenhum nível encontrado.
                </div>
               )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomCombobox;
