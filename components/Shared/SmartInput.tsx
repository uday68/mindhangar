import React, { useState, useEffect, useRef } from 'react';
import { aiAssistant } from '../../src/services/AIAssistantService';
import { Icons } from '../Icons';

interface SmartInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'textarea' | 'number';
  placeholder?: string;
  aiEnabled?: boolean;
  context?: string;
  rules?: string[];
  className?: string;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  aiEnabled = true,
  context,
  rules,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message?: string;
  } | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Auto-validate on change
  useEffect(() => {
    if (!aiEnabled || !aiAssistant.isReady() || !value) {
      setValidationResult(null);
      return;
    }

    // Debounce validation
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsValidating(true);
      const result = await aiAssistant.validateInput(label, value, rules);
      setValidationResult({
        isValid: result.isValid,
        message: result.suggestions[0]
      });
      setIsValidating(false);
    }, 1000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, label, rules, aiEnabled]);

  // Get autocomplete suggestions
  const handleInputChange = async (newValue: string) => {
    onChange(newValue);

    if (!aiEnabled || !aiAssistant.isReady() || newValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Get suggestions
    const autocompleteSuggestions = await aiAssistant.getAutocompleteSuggestions(
      label,
      newValue,
      context
    );

    if (autocompleteSuggestions.length > 0) {
      setSuggestions(autocompleteSuggestions);
      setShowSuggestions(true);
    }
  };

  // Improve text with AI
  const handleImprove = async () => {
    if (!value || !aiAssistant.isReady()) return;

    setIsImproving(true);
    const improved = await aiAssistant.improveText(value, 'casual');
    onChange(improved);
    setIsImproving(false);
  };

  // Apply suggestion
  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {aiEnabled && aiAssistant.isReady() && (
          <span className="ml-2 text-xs text-indigo-600 font-normal">
            ✨ AI-powered
          </span>
        )}
      </label>

      {/* Input Field */}
      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          type={type !== 'textarea' ? type : undefined}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
            validationResult?.isValid === false
              ? 'border-red-300 bg-red-50'
              : validationResult?.isValid === true
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300'
          } ${type === 'textarea' ? 'min-h-[100px] resize-y' : ''}`}
          rows={type === 'textarea' ? 4 : undefined}
        />

        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isValidating && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          {validationResult?.isValid === true && !isValidating && (
            <Icons.Check size={16} className="text-green-600" />
          )}
          {validationResult?.isValid === false && !isValidating && (
            <Icons.AlertTriangle size={16} className="text-red-600" />
          )}
        </div>
      </div>

      {/* Validation Message */}
      {validationResult?.message && (
        <p className={`text-xs mt-1 ${
          validationResult.isValid ? 'text-green-600' : 'text-red-600'
        }`}>
          {validationResult.message}
        </p>
      )}

      {/* AI Actions */}
      {aiEnabled && aiAssistant.isReady() && value && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleImprove}
            disabled={isImproving}
            className="text-xs px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isImproving ? (
              <>
                <div className="w-3 h-3 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                Improving...
              </>
            ) : (
              <>
                <Icons.Sparkles size={12} />
                Improve with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0"
            >
              <Icons.Sparkles size={12} className="text-indigo-600 flex-shrink-0" />
              <span className="flex-1">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
