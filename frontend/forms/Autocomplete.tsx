'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface AutocompleteProps {
  readonly value: string;
  readonly onChange: (value: string, optionId?: string) => void;
  readonly onSearch: (query: string) => Promise<AutocompleteOption[]>;
  readonly placeholder?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
}

export default function Autocomplete({
  value,
  onChange,
  onSearch,
  placeholder,
  label,
  required = false,
  className = '',
  id
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Debounce para búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.trim().length >= 3) {
        setIsLoading(true);
        try {
          const results = await onSearch(value);
          setOptions(results);
          setIsOpen(true);
        } catch (error) {
          console.error('Error en búsqueda:', error);
          setOptions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setOptions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    onChange(option.label, option.id);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setOptions([]); // Limpiar opciones
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleOptionClick(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && '*'}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (options.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className="form-input pr-8"
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && options.length > 0 && (
        <div
          ref={optionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === highlightedIndex ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{option.label}</div>
              {option.subtitle && (
                <div className="text-sm text-gray-500 mt-1">{option.subtitle}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && options.length === 0 && value.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            No se encontraron resultados
          </div>
        </div>
      )}
    </div>
  );
}