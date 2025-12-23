
import React from 'react';
import { Question, QuestionState, QuestionType, QuestionDifficulty, SubmissionStage } from '../types';
import LatexRenderer from './LatexRenderer';

interface Props {
  fontSize: number;
  question: Question;
  state: QuestionState;
  isSubmitting?: boolean;
  submissionStage?: SubmissionStage;
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
  question, state, isSubmitting = false, submissionStage = SubmissionStage.IDLE,
  onSelectOption, onSetNumerical, onClear, 
  onSaveNext, onSaveMark, onMarkNext, 
  onBack, onNext, onSubmit 
}) => {
  const getDifficultyColor = (diff: QuestionDifficulty) => {
    switch(diff) {
      case QuestionDifficulty.EASY: return 'bg-emerald-500';
      case QuestionDifficulty.MEDIUM: return 'bg-[#f0ad4e]'; 
      case QuestionDifficulty.HARD: return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden border-r border-[#ddd]">
      {/* Question Breadcrumb Bar */}
      <div className="bg-[#f5f5f5] border-b border-[#ddd] px-4 py-2 flex items-center gap-2 shrink-0">
        <div className="bg-[#337ab7] text-white px-3 py-1 text-[11px] font-black rounded-sm shadow-sm">
          Q. {question.id}
        </div>
        <div className="bg-[#0b3c66] text-white px-5 py-1 text-[11px] font-black uppercase rounded-sm shadow-sm">
          {question.subject}
        </div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight ml-2 border-l border-gray-300 pl-3">
          SECTION {question.section} ({question.type})
        </div>
        <div className={`${getDifficultyColor(question.difficulty)} text-white px-3 py-0.5 rounded-sm text-[10px] font-black uppercase ml-2 shadow-sm`}>
          {question.difficulty}
        </div>
        <div className="ml-auto bg-[#5cb85c] text-white px-3 py-0.5 rounded-sm text-[11px] font-black shadow-sm">
          +4 / {question.type === QuestionType.MCQ ? '-1' : '0'}
        </div>
      </div>

      {/* Main Question Body */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar border-b border-[#ddd] bg-white">
        <div className="mb-10 select-none">
          <div className="text-gray-800" style={{ fontSize: `${fontSize}px` }}>
            <LatexRenderer content={question.text} />
          </div>
        </div>

        {question.type === QuestionType.MCQ ? (
          <div className="space-y-4 max-w-4xl">
            {question.options?.map((opt, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <span className="font-bold text-gray-400 mt-4 text-xs">({String.fromCharCode(65 + idx)})</span>
                <label className={`flex items-center gap-4 cursor-pointer py-4 px-6 rounded-lg border transition-all w-full ${state.selectedOption === idx ? 'bg-blue-50 border-[#337ab7]' : 'bg-white border-gray-200 hover:border-gray-300'} ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input 
                    type="radio" 
                    name={`q-${question.id}`}
                    checked={state.selectedOption === idx}
                    onChange={() => onSelectOption(idx)}
                    disabled={isSubmitting}
                    className="w-5 h-5 accent-[#337ab7]"
                  />
                  <div className="text-gray-800" style={{ fontSize: `${fontSize}px` }}>
                    <LatexRenderer content={opt} />
                  </div>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-sm pt-4">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Candidate Input:</label>
            <input 
              type="text" 
              value={state.numericalAnswer || ''}
              onChange={(e) => onSetNumerical(e.target.value)}
              disabled={isSubmitting}
              className="w-full border-2 border-[#337ab7] p-4 rounded-xl text-2xl font-black text-[#337ab7] outline-none shadow-inner bg-blue-50/10 placeholder-gray-300"
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      {/* Control Buttons (Row 1 & 2) */}
      <div className="bg-white border-t border-[#ddd] p-3 flex flex-col gap-2 shrink-0">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onSaveNext}
            disabled={isSubmitting}
            className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-[11px] font-black px-6 py-2.5 rounded-sm shadow-sm transition-all active:scale-95 uppercase border border-[#4cae4c] disabled:grayscale"
          >
            Save & Next
          </button>
          <button 
            onClick={onClear}
            disabled={isSubmitting}
            className="bg-white hover:bg-gray-50 text-gray-600 text-[11px] font-black px-8 py-2.5 rounded-sm border border-[#ccc] shadow-sm transition-all active:scale-95 uppercase disabled:opacity-50"
          >
            Clear
          </button>
          <button 
            onClick={onSaveMark}
            disabled={isSubmitting}
            className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white text-[11px] font-black px-6 py-2.5 rounded-sm shadow-sm transition-all active:scale-95 uppercase border border-[#eea236] disabled:grayscale"
          >
            Save & Mark for Review
          </button>
        </div>
        <div>
          <button 
            onClick={onMarkNext}
            disabled={isSubmitting}
            className="bg-[#5bc0de] hover:bg-[#46b8da] text-white text-[11px] font-black px-6 py-2.5 rounded-sm shadow-sm transition-all active:scale-95 uppercase border border-[#46b8da] disabled:grayscale"
          >
            Mark for Review & Next
          </button>
        </div>
      </div>

      {/* Footer Navigation & Final Submission */}
      <div className="bg-[#eee] p-3 flex justify-between items-center shrink-0 border-t border-[#ccc]">
        <div className="flex gap-2">
            <button 
                onClick={onBack}
                disabled={isSubmitting}
                className="bg-white hover:bg-gray-50 text-[#0b3c66] text-[11px] font-black px-8 py-2.5 rounded-sm border border-[#ccc] shadow-sm transition-all active:scale-95 uppercase disabled:opacity-50"
            >
                &larr; Back
            </button>
            <button 
                onClick={onNext}
                disabled={isSubmitting}
                className="bg-white hover:bg-gray-50 text-[#0b3c66] text-[11px] font-black px-8 py-2.5 rounded-sm border border-[#ccc] shadow-sm transition-all active:scale-95 uppercase disabled:opacity-50"
            >
                Next &rarr;
            </button>
        </div>

        {/* The Final Submit Button */}
        <div className="p-1 px-3 border-2 border-[#4d94d1] bg-[#eef6fb] rounded-sm">
            <button 
                onClick={onSubmit}
                disabled={isSubmitting}
                className="bg-[#337ab7] hover:bg-[#286090] text-white text-[14px] font-black px-12 py-3 rounded-sm shadow-md transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-3 min-w-[200px] disabled:opacity-80 border-b-4 border-[#1e4a70]"
            >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[11px] uppercase tracking-tight">Processing...</span>
                  </>
                ) : 'Final Submit'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionArea;
