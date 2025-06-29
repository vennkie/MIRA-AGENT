import React, { useState, useCallback } from 'react';
import { Database, Search as SearchIcon } from 'lucide-react';
import { CSVUploader } from './components/CSVUploader';
import { SearchBox } from './components/SearchBox';
import { ResultsTable } from './components/ResultsTable';
import { CSVSearcher } from './utils/searchUtils';
import { CSVRow, SearchResult } from './types';

function App() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [searcher, setSearcher] = useState<CSVSearcher | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  const handleDataLoaded = useCallback((data: CSVRow[]) => {
    setCsvData(data);
    setSearcher(new CSVSearcher(data));
    setSearchResult(null);
    setHasSearched(false);
    setCurrentQuery('');
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!searcher) return;

    setIsSearching(true);
    setCurrentQuery(query);
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const result = searcher.search(query);
      setSearchResult(result);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResult(null);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, [searcher]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MIRA AGENT</h1>
              <p className="text-gray-600 mt-1">
                Upload a CSV
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Step 1: Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Upload CSV File</h2>
          </div>
          <CSVUploader onDataLoaded={handleDataLoaded} />
        </div>

        {/* Step 2: Search */}
        {csvData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Select Description</h2>
            </div>
            <SearchBox 
              onSearch={handleSearch}
              isSearching={isSearching}
              disabled={!searcher}
              csvData={csvData}
            />
          </div>
        )}

        {/* Step 3: Results */}
        <ResultsTable 
          result={searchResult}
          hasSearched={hasSearched}
          query={currentQuery}
        />

        {/* Footer */}
        {csvData.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Get started by uploading your CSV
              </h3>
              <p className="text-gray-600">
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;