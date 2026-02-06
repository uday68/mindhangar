import { useState } from 'react';
import { Icons } from '../Icons';

export type EducationBoard = 'CBSE' | 'ICSE' | 'State' | 'Other';
export type ExamFocus = 'Board Exams' | 'JEE' | 'NEET' | 'UPSC' | 'CAT' | 'GATE' | 'Other' | 'None';

interface BoardSelectionProps {
  onComplete: (data: BoardSelectionData) => void;
  onSkip?: () => void;
  initialData?: Partial<BoardSelectionData>;
}

export interface BoardSelectionData {
  board: EducationBoard;
  state?: string;
  examFocus: ExamFocus;
  targetYear?: number;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const BoardSelection: React.FC<BoardSelectionProps> = ({ 
  onComplete, 
  onSkip,
  initialData 
}) => {
  const [board, setBoard] = useState<EducationBoard>(initialData?.board || 'CBSE');
  const [state, setState] = useState<string>(initialData?.state || '');
  const [examFocus, setExamFocus] = useState<ExamFocus>(initialData?.examFocus || 'None');
  const [targetYear, setTargetYear] = useState<number>(initialData?.targetYear || new Date().getFullYear() + 1);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const handleSubmit = () => {
    const data: BoardSelectionData = {
      board,
      examFocus,
      targetYear: examFocus !== 'None' ? targetYear : undefined
    };

    if (board === 'State') {
      data.state = state;
    }

    onComplete(data);
  };

  const isValid = () => {
    if (board === 'State' && !state) return false;
    return true;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
            <Icons.FileText size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Education Board</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Help us customize your learning experience for the Indian education system
        </p>
      </div>

      {/* Board Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Which board are you studying under?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['CBSE', 'ICSE', 'State', 'Other'] as EducationBoard[]).map((boardOption) => (
            <button
              key={boardOption}
              onClick={() => setBoard(boardOption)}
              className={`p-4 rounded-xl border-2 transition-all ${
                board === boardOption
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  board === boardOption
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}>
                  {board === boardOption && (
                    <Icons.Check size={12} className="text-white" />
                  )}
                </div>
                <span className={`font-medium ${
                  board === boardOption ? 'text-orange-700' : 'text-gray-700'
                }`}>
                  {boardOption}
                </span>
              </div>
              {boardOption === 'CBSE' && (
                <p className="text-xs text-gray-500 mt-2 text-left">
                  Central Board of Secondary Education
                </p>
              )}
              {boardOption === 'ICSE' && (
                <p className="text-xs text-gray-500 mt-2 text-left">
                  Indian Certificate of Secondary Education
                </p>
              )}
              {boardOption === 'State' && (
                <p className="text-xs text-gray-500 mt-2 text-left">
                  State Board (Select your state below)
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* State Selection (if State Board selected) */}
      {board === 'State' && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select your state
          </label>
          <div className="relative">
            <button
              onClick={() => setShowStateDropdown(!showStateDropdown)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-orange-400 transition-colors"
            >
              <span className={state ? 'text-gray-800' : 'text-gray-400'}>
                {state || 'Choose your state...'}
              </span>
              <Icons.ChevronDown size={20} className={`text-gray-400 transition-transform ${showStateDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showStateDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {INDIAN_STATES.map((stateName) => (
                  <button
                    key={stateName}
                    onClick={() => {
                      setState(stateName);
                      setShowStateDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-orange-50 transition-colors text-sm"
                  >
                    {stateName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exam Focus */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Are you preparing for any competitive exam?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['None', 'Board Exams', 'JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'Other'] as ExamFocus[]).map((exam) => (
            <button
              key={exam}
              onClick={() => setExamFocus(exam)}
              className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                examFocus === exam
                  ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                  : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>
      </div>

      {/* Target Year (if exam selected) */}
      {examFocus !== 'None' && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Target year for {examFocus}
          </label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((offset) => {
              const year = new Date().getFullYear() + offset;
              return (
                <button
                  key={year}
                  onClick={() => setTargetYear(year)}
                  className={`flex-1 p-3 rounded-lg border transition-all font-medium ${
                    targetYear === year
                      ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                      : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex gap-3">
          <Icons.AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why do we need this?</p>
            <p className="text-blue-700">
              We'll customize your learning content, practice questions, and study materials 
              according to your board's syllabus and exam pattern. This ensures you're always 
              studying the right topics in the right way.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          Continue
          <Icons.ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default BoardSelection;
