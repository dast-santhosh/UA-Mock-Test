
import React from 'react';
import { Question, QuestionState, QuestionType, QuestionDifficulty, SubmissionStage } from '../types';
import LatexRenderer from './LatexRenderer';

interface Props {
  fontSize: number;
  question: Question;
  state: QuestionState;
  isSubmitting?: boolean;
  onSelectOption: (optionIdx: number) => void;
  onSetNumerical: (val: string) => void;
  onClear: () => void;
  onSaveNext: () => void;
  onSaveMark: () => void;
  onMarkNext: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const QuestionArea: React.FC<Props> = ({ 
  fontSize,
  question, state, isSubmitting = false,
  onSelectOption, onSetNumerical, onClear, 
  onSaveNext, onSaveMark, onMarkNext, 
  onBack, onNext
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden border-r border-[#ddd]">
      {/* Question Header */}
      <div className="bg-[#f5f5f5] border-b border-[#ddd] px-4 py-1.5 flex items-center justify-between shrink-0">
        <div className="text-[14px] font-bold text-gray-800">
          Question No. {question.id}
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[11px] font-bold flex items-center gap-2">
             <span className="text-gray-500">Marks:</span>
             <span className="bg-[#5cb85c] text-white px-2 py-0.5 rounded text-[10px] tracking-tighter">+4.0</span>
             <span className="bg-[#d9534f] text-white px-2 py-0.5 rounded text-[10px] tracking-tighter">{question.type === QuestionType.MCQ ? '-1.0' : '0.0'}</span>
           </div>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar border-b border-[#ddd] bg-white">
        <div className="mb-8 select-none">
          <div className="text-gray-800 leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
            <LatexRenderer content={question.text} />
          </div>
        </div>

        {question.type === QuestionType.MCQ ? (
          <div className="space-y-2 max-w-4xl">
            {question.options?.map((opt, idx) => (
              <label key={idx} className={`flex items-start gap-4 cursor-pointer p-4 rounded border transition-all w-full ${state.selectedOption === idx ? 'bg-[#e7f1f9] border-[#337ab7]' : 'bg-white border-gray-100 hover:border-gray-200'} ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                <input 
                  type="radio" 
                  name={`q-${question.id}`}
                  checked={state.selectedOption === idx}
                  onChange={() => onSelectOption(idx)}
                  disabled={isSubmitting}
                  className="mt-1 w-4 h-4 accent-[#337ab7]"
                />
                <div className="flex gap-2">
                  <span className="font-bold text-gray-500">({idx + 1})</span>
                  <div className="text-gray-800" style={{ fontSize: `${fontSize}px` }}>
                    <LatexRenderer content={opt} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-sm pt-4">
            <label className="block text-[12px] font-bold text-gray-600 uppercase">Type your answer here:</label>
            <input 
              type="text" 
              value={state.numericalAnswer || ''}
              onChange={(e) => onSetNumerical(e.target.value)}
              disabled={isSubmitting}
              className="w-full border border-gray-300 p-2 rounded text-lg font-bold text-[#337ab7] outline-none focus:border-[#337ab7] shadow-inner"
              placeholder="Enter Value"
            />
          </div>
        )}
      </div>

      {/* Footer Controls - Exact NTA Grid */}
      <div className="bg-[#f5f5f5] p-3 flex flex-col gap-3 shrink-0 border-t border-[#ccc]">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={onSaveNext}
              className="bg-[#5cb85c] hover:bg-[#449d44] text-white text-[11px] font-bold px-5 py-2 rounded border border-[#4cae4c] shadow-sm transition-all active:scale-95"
            >
              Save & Next
            </button>
            <button 
              onClick={onClear}
              className="bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-5 py-2 rounded border border-[#ccc] shadow-sm transition-all active:scale-95"
            >
              Clear
            </button>
            <button 
              onClick={onSaveMark}
              className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white text-[11px] font-bold px-5 py-2 rounded border border-[#eea236] shadow-sm transition-all active:scale-95"
            >
              Save & Mark for Review
            </button>
          </div>
          
          <button 
            onClick={onMarkNext}
            className="bg-[#337ab7] hover:bg-[#286090] text-white text-[11px] font-bold px-5 py-2 rounded border border-[#2e6da4] shadow-sm transition-all active:scale-95"
          >
            Mark for Review & Next
          </button>
        </div>

        <div className="flex justify-between items-center border-t border-gray-300 pt-3">
          <div className="flex gap-2">
            <button 
              onClick={onBack}
              className="bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-8 py-2 rounded border border-[#ccc] shadow-sm transition-all active:scale-95"
            >
              &laquo; Back
            </button>
            <button 
              onClick={onNext}
              className="bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-8 py-2 rounded border border-[#ccc] shadow-sm transition-all active:scale-95"
            >
              Next &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionArea;
