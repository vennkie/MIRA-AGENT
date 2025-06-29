import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Target, Zap, BookOpen, Loader2, AlertCircle, Tag, Settings, Clock } from 'lucide-react';
import { SearchResult, AIProvider } from '../types';
import { generateInstructions, generateDurationEstimate } from '../utils/aiProviders';
import { AIProviderSelector } from './AIProviderSelector';

interface ResultsTableProps {
  result: SearchResult | null;
  hasSearched: boolean;
  query: string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result, hasSearched, query }) => {
  const [instructions, setInstructions] = useState<string>('');
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [instructionsError, setInstructionsError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('groq');
  const [duration, setDuration] = useState<string>('');
  const [isGeneratingDuration, setIsGeneratingDuration] = useState(false);
  const [durationError, setDurationError] = useState<string | null>(null);

  useEffect(() => {
    if (result && result.item) {
      generateAIInstructions();
      generateDuration();
    }
  }, [result]);

  const generateAIInstructions = async () => {
    if (!result?.item) return;

    setIsGeneratingInstructions(true);
    setInstructionsError(null);
    setInstructions('');

    try {
      const generatedInstructions = await generateInstructions(
        result.item.Description,
        result.item.Actions,
        result.item.Objects,
        selectedProvider
      );
      setInstructions(generatedInstructions);
    } catch (error) {
      setInstructionsError(error instanceof Error ? error.message : 'Failed to generate instructions');
    } finally {
      setIsGeneratingInstructions(false);
    }
  };

  const generateDuration = async () => {
    if (!result?.item) return;

    setIsGeneratingDuration(true);
    setDurationError(null);
    setDuration('');

    try {
      const estimatedDuration = await generateDurationEstimate(
        result.item.Description,
        result.item.Actions,
        result.item.Objects
      );
      setDuration(estimatedDuration);
    } catch (error) {
      setDurationError(error instanceof Error ? error.message : 'Failed to generate duration estimate');
    } finally {
      setIsGeneratingDuration(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    // Auto-regenerate instructions when provider changes
    if (result?.item && instructions) {
      generateAIInstructions();
    }
  };

  const getStepTypeColor = (stepType: string) => {
    const type = stepType.toLowerCase();
    switch (type) {
      case 'preparation':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'action':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'verification':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'safety':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'documentation':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'analysis':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatInstructions = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const formattedSteps: JSX.Element[] = [];
    let stepNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^\d+\./)) {
        // This is a numbered step
        stepNumber++;
        const stepContent = line.replace(/^\d+\.\s*/, '');
        
        // Extract duration and type from the step content
        const durationMatch = stepContent.match(/DUR\s+([^T]+)/);
        const typeMatch = stepContent.match(/Type:\s*(.+)$/);
        
        let stepText = stepContent;
        let duration = '';
        let instructionType = '';
        
        if (durationMatch) {
          duration = durationMatch[1].trim();
          // Remove DUR part from step text
          stepText = stepContent.replace(/DUR\s+[^T]+/, '').trim();
        }
        
        if (typeMatch) {
          instructionType = typeMatch[1].trim();
          // Remove Type part from step text
          stepText = stepText.replace(/Type:\s*.+$/, '').trim();
        }
        
        // Clean up any remaining colons or extra spaces
        stepText = stepText.replace(/:\s*$/, '').trim();

        formattedSteps.push(
          <div key={stepNumber} className="mb-6 last:mb-0">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                {stepNumber}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed font-medium mb-2">
                  {stepText}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  {duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {duration}
                    </span>
                  )}
                </div>
                {instructionType && (
                  <p className="text-sm text-gray-600 font-medium">
                    Type: {instructionType}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      }
    }

    return formattedSteps.length > 0 ? formattedSteps : (
      <p className="text-gray-700 leading-relaxed">{text}</p>
    );
  };

  if (!hasSearched) {
    return null;
  }

  if (!result) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No matching description found
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't find a close match for "{query}" in the CSV data.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <p className="font-medium mb-2">Tips for better results:</p>
              <ul className="text-left space-y-1">
                <li>• Try using different keywords or phrases</li>
                <li>• Check for typos in your search query</li>
                <li>• Use more general terms if your search is too specific</li>
                <li>• Ensure your CSV contains relevant descriptions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { item, score } = result;
  const confidenceScore = score ? Math.round((1 - score) * 100) : 100;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            Task Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">Duration</h4>
                  {!isGeneratingDuration && !durationError && duration && (
                    <button
                      onClick={generateDuration}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Regenerate
                    </button>
                  )}
                </div>
                
                {isGeneratingDuration && (
                  <div className="flex items-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <div>
                      <p className="text-blue-700 font-medium">Estimating duration...</p>
                      <p className="text-sm text-blue-600">AI is analyzing task complexity</p>
                    </div>
                  </div>
                )}

                {durationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Failed to estimate duration</p>
                        <p className="text-sm text-red-600 mt-1">{durationError}</p>
                        <button
                          onClick={generateDuration}
                          className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {duration && !isGeneratingDuration && !durationError && (
                  <p className="text-gray-700 leading-relaxed font-medium text-lg">{duration}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">Actions</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">{item.Actions}</p>
              </div>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">Objects</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">{item.Objects}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            Instructions
          </h3>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                {!isGeneratingInstructions && !instructionsError && instructions && (
                  <button
                    onClick={generateAIInstructions}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Regenerate
                  </button>
                )}
              </div>

              {/* AI Provider Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose AI Provider:
                </label>
                <div className="max-w-md">
                  <AIProviderSelector
                    selectedProvider={selectedProvider}
                    onProviderChange={handleProviderChange}
                    disabled={isGeneratingInstructions}
                  />
                </div>
              </div>

              {isGeneratingInstructions && (
                <div className="flex items-center gap-3 py-8">
                  <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                  <div>
                    <p className="text-orange-700 font-medium">Generating instructions...</p>
                    <p className="text-sm text-orange-600">AI is analyzing the task details and creating step types</p>
                  </div>
                </div>
              )}

              {instructionsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">Failed to generate instructions</p>
                      <p className="text-sm text-red-600 mt-1">{instructionsError}</p>
                      <button
                        onClick={generateAIInstructions}
                        className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {instructions && !isGeneratingInstructions && !instructionsError && (
                <div className="bg-white rounded-lg p-6 border border-orange-200">
                  <div className="space-y-4">
                    {formatInstructions(instructions)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};