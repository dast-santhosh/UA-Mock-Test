import React from 'react';
import { Question, QuestionStatus, QuestionState, Student } from '../types';
import { 
  NotVisitedShape, 
  NotAnsweredShape, 
  AnsweredShape, 
  MarkedForReviewShape, 
  AnsweredMarkedShape 
} from './StatusShapes';

interface Props {
  questions: Question[];
  questionStates: Record<number, QuestionState>;
  currentIndex: number;
  student: Student | null;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

const QuestionPalette: React.FC<Props> = ({ questions, questionStates, currentIndex, student, onSelect, onSubmit }) => {
  const getCounts = () => {
    const counts = {
      [QuestionStatus.NOT_VISITED]: 0,
      [QuestionStatus.NOT_ANSWERED]: 0,
      [QuestionStatus.ANSWERED]: 0,
      [QuestionStatus.MARKED_FOR_REVIEW]: 0,
      [QuestionStatus.ANSWERED_AND_MARKED_FOR_REVIEW]: 0,
    };
    
    questions.forEach(q => {
      const state = questionStates[q.id];
      counts[state?.status || QuestionStatus.NOT_VISITED]++;
    });
    
    return counts;
  };

  const counts = getCounts();

  const renderShape = (qId: number, statusOverride?: QuestionStatus) => {
    const state = questionStates[qId];
    const status = statusOverride || state?.status || QuestionStatus.NOT_VISITED;
    const label = statusOverride ? counts[status] : qId.toString();

    switch (status) {
      case QuestionStatus.ANSWERED: return <AnsweredShape label={label} />;
      case QuestionStatus.NOT_ANSWERED: return <NotAnsweredShape label={label} />;
      case QuestionStatus.MARKED_FOR_REVIEW: return <MarkedForReviewShape label={label} />;
      case QuestionStatus.ANSWERED_AND_MARKED_FOR_REVIEW: return <AnsweredMarkedShape label={label} />;
      default: return <NotVisitedShape label={label} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f2f2f2] border-l border-[#ddd] overflow-hidden">
      {/* Candidate Profile Area */}
      <div className="p-4 bg-white border-b border-[#ddd] flex items-center gap-4">
        <div className="w-16 h-20 bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${student?.name || 'C'}`} className="w-full h-full object-cover" alt="Profile" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Candidate Name:</span>
          <span className="text-[12px] font-black text-[#0b3c66] truncate uppercase mb-2">{student?.name || "GUEST"}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Subject Name:</span>
          <span className="text-[11px] font-black text-gray-700 truncate uppercase">JEE Main Mock</span>
        </div>
      </div>

      {/* Official Status Legend */}
      <div className="p-4 bg-white border-b border-[#ddd] overflow-y-auto max-h-[160px] custom-scrollbar">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          <div className="flex items-center gap-2">
            <AnsweredShape label={counts[QuestionStatus.ANSWERED]} className="scale-75 origin-center" />
            <span className="text-[10px] font-bold text-gray-600 leading-none">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <NotAnsweredShape label={counts[QuestionStatus.NOT_ANSWERED]} className="scale-75 origin-center" />
            <span className="text-[10px] font-bold text-gray-600 leading-none">Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <NotVisitedShape label={counts[QuestionStatus.NOT_VISITED]} className="scale-75 origin-center" />
            <span className="text-[10px] font-bold text-gray-600 leading-none">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <MarkedForReviewShape label={counts[QuestionStatus.MARKED_FOR_REVIEW]} className="scale-75 origin-center" />
            <span className="text-[10px] font-bold text-gray-600 leading-none">Marked for Review</span>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2">
          <AnsweredMarkedShape label={counts[QuestionStatus.ANSWERED_AND_MARKED_FOR_REVIEW]} className="scale-75 origin-top shrink-0" />
          <span className="text-[9px] font-bold text-gray-500 leading-tight">Answered & Marked for Review (will be considered for evaluation)</span>
        </div>
      </div>

      {/* Palette Title */}
      <div className="bg-[#337ab7] text-white text-[11px] font-bold py-1 px-4 uppercase shrink-0">
        Question Palette
      </div>

      {/* Grid of Questions */}
      <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 justify-items-center">
          {questions.map((q, idx) => (
            <button 
                key={q.id} 
                onClick={() => onSelect(idx)}
                className={`transition-all outline-none rounded-sm ${currentIndex === idx ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
            >
              {renderShape(q.id)}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-3 bg-[#e5f1fa] border-t border-[#ddd] flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
            <button className="bg-white border border-[#ccc] py-1.5 text-[10px] font-bold text-gray-700 hover:bg-gray-50 uppercase shadow-sm">Question Paper</button>
            <button className="bg-white border border-[#ccc] py-1.5 text-[10px] font-bold text-gray-700 hover:bg-gray-50 uppercase shadow-sm">Instructions</button>
        </div>
        <button 
          onClick={onSubmit}
          className="w-full bg-[#337ab7] hover:bg-[#286090] text-white py-2.5 text-[13px] font-black uppercase rounded shadow-md transition-all active:scale-95 mt-1"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default QuestionPalette;