import React, { useState, useCallback } from 'react';
import { Database, Search as SearchIcon } from 'lucide-react';
import { CSVUploader } from './components/CSVUploader';
import { SearchBox } from './components/SearchBox';
import { ResultsTable, TaskDetails } from './components/ResultsTable';
import { CSVSearcher } from './utils/searchUtils';
import { CSVRow, SearchResult } from './types';

function App() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [searcher, setSearcher] = useState<CSVSearcher | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [duration, setDuration] = useState('');
  const [isGeneratingDuration, setIsGeneratingDuration] = useState(false);
  const [durationError, setDurationError] = useState<string | null>(null);

  const handleDataLoaded = useCallback((data: CSVRow[]) => {
    setCsvData(data);
    setSearcher(new CSVSearcher(data));
    setSearchResult(null);
    setHasSearched(false);
    setCurrentQuery('');
    setDuration('');
    setIsGeneratingDuration(false);
    setDurationError(null);
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

  const generateDuration = useCallback(async () => {
    if (!searchResult?.item) return;
    setIsGeneratingDuration(true);
    setDurationError(null);
    setDuration('');
    try {
      // Import generateDurationEstimate from utils/aiProviders
      const { generateDurationEstimate } = await import('./utils/aiProviders');
      const estimatedDuration = await generateDurationEstimate(
        searchResult.item.Description,
        searchResult.item.Actions,
        searchResult.item.Objects
      );
      setDuration(estimatedDuration);
    } catch (error) {
      setDurationError(error instanceof Error ? error.message : 'Failed to generate duration estimate');
    } finally {
      setIsGeneratingDuration(false);
    }
  }, [searchResult]);

  React.useEffect(() => {
    if (searchResult && searchResult.item) {
      generateDuration();
    } else {
      setDuration('');
      setDurationError(null);
      setIsGeneratingDuration(false);
    }
  }, [searchResult, generateDuration]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">MIRA AGENT</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
          {/* Left Column: Upload & Search & Task Details */}
          <div className="md:w-1/2 w-full flex flex-col gap-6 md:gap-8">
            {/* Step 1: Upload */}
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                  1
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Upload CSV File</h2>
              </div>
              <CSVUploader onDataLoaded={handleDataLoaded} />
            </div>

            {/* Step 2: Search */}
            {csvData.length > 0 && (
              <div className="space-y-2 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                    2
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Select Description</h2>
                </div>
                <SearchBox 
                  onSearch={handleSearch}
                  isSearching={isSearching}
                  disabled={!searcher}
                  csvData={csvData}
                />
              </div>
            )}

            {/* Task Details Section */}
            {csvData.length > 0 && hasSearched && (
              <div className="w-full">
                <TaskDetails
                  result={searchResult}
                  hasSearched={hasSearched}
                  duration={duration}
                  isGeneratingDuration={isGeneratingDuration}
                  durationError={durationError}
                  generateDuration={generateDuration}
                />
              </div>
            )}

            {/* Footer for left column */}
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

          {/* Right Column: Results/Instructions */}
          <div className="md:w-1/2 w-full flex flex-col justify-start">
            <ResultsTable 
              result={searchResult}
              hasSearched={hasSearched}
              query={currentQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;