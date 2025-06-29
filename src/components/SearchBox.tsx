import React, { useState, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { CSVRow } from '../types';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  disabled?: boolean;
  csvData: CSVRow[];
}

export const SearchBox: React.FC<SearchBoxProps> = ({ 
  onSearch, 
  isSearching = false, 
  disabled = false,
  csvData
}) => {
  const [selectedDescription, setSelectedDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDescription && !disabled) {
      onSearch(selectedDescription);
      setIsOpen(false);
    }
  }, [selectedDescription, onSearch, disabled]);

  const handleDescriptionSelect = (description: string) => {
    setSelectedDescription(description);
    setIsOpen(false);
  };

  const uniqueDescriptions = Array.from(new Set(csvData.map(row => row.Description)))
    .filter(desc => desc && desc.trim())
    .sort();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled || isSearching || uniqueDescriptions.length === 0}
            className={`
              w-full px-4 py-4 text-left border border-gray-300 rounded-xl
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              transition-all duration-200 ease-in-out flex items-center justify-between
              ${disabled || uniqueDescriptions.length === 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
              ${isSearching ? 'bg-gray-50' : ''}
            `}
          >
            <span className={`text-lg ${selectedDescription ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedDescription || 'Select a description to search...'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && uniqueDescriptions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {uniqueDescriptions.map((description, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDescriptionSelect(description)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900 line-clamp-2">{description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Search Button */}
        <button
          type="submit"
          disabled={!selectedDescription || disabled || isSearching}
          className={`
            absolute inset-y-0 right-0 px-6 mx-1 my-1 rounded-lg font-medium
            transition-all duration-200 ease-in-out flex items-center gap-2
            ${selectedDescription && !disabled && !isSearching
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Search className="w-4 h-4" />
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {/* Click outside to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </form>
  );
};