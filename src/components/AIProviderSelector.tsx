import React from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { AIProvider } from '../types';
import { AI_PROVIDERS } from '../utils/aiProviders';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedProviderInfo = AI_PROVIDERS.find(p => p.id === selectedProvider);

  const handleProviderSelect = (provider: AIProvider) => {
    onProviderChange(provider);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-left border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
          transition-all duration-200 ease-in-out flex items-center justify-between
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {selectedProviderInfo?.name}
            </span>
            <p className="text-sm text-gray-500">
              {selectedProviderInfo?.description}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {AI_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleProviderSelect(provider.id)}
              className={`
                w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none 
                transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg
                ${selectedProvider === provider.id ? 'bg-blue-50 border-blue-200' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  p-1.5 rounded-md
                  ${selectedProvider === provider.id ? 'bg-blue-200' : 'bg-gray-100'}
                `}>
                  <Cpu className={`
                    w-4 h-4 
                    ${selectedProvider === provider.id ? 'text-blue-700' : 'text-gray-600'}
                  `} />
                </div>
                <div>
                  <span className={`
                    font-medium 
                    ${selectedProvider === provider.id ? 'text-blue-900' : 'text-gray-900'}
                  `}>
                    {provider.name}
                  </span>
                  <p className={`
                    text-sm 
                    ${selectedProvider === provider.id ? 'text-blue-700' : 'text-gray-500'}
                  `}>
                    {provider.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};