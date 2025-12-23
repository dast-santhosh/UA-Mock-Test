
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

  const renderShape = (qId: number, isSummary = false) => {
    const state = questionStates[qId];
    const status = state?.status || QuestionStatus.NOT_VISITED;
    const label = isSummary ? counts[status] : qId.toString().padStart(2, '0');

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
      {/* Profile Info */}
      <div className="p-4 bg-white border-b border-[#ddd] flex items-center gap-4">
        <div className="w-20 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || 'Candidate'}`} className="w-full h-full object-cover" alt="Profile" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[12px] font-black text-[#0b3c66] truncate uppercase">{student?.name || "Guest Candidate"}</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase mt-2">Roll No:</span>
          <span className="text-[12px] font-black text-gray-700">{student?.rollNumber || "NTA-0000"}</span>
        </div>
      </div>

      {/* Legend Area */}
      <div className="p-4 bg-white border-b border-[#ddd]">
        <div className="grid grid-cols-2 gap-y-3">
          <div className="flex items-center gap-2">
            <AnsweredShape label={counts[QuestionStatus.ANSWERED]} className="scale-75 origin-center" />
            <span className="text-[11px] font-bold text-gray-600">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <NotAnsweredShape label={counts[QuestionStatus.NOT_ANSWERED]} className="scale-75 origin-center" />
            <span className="text-[11px] font-bold text-gray-600">Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <NotVisitedShape label={counts[QuestionStatus.NOT_VISITED]} className="scale-75 origin-center" />
            <span className="text-[11px] font-bold text-gray-600">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <MarkedForReviewShape label={counts[QuestionStatus.MARKED_FOR_REVIEW]} className="scale-75 origin-center" />
            <span className="text-[11px] font-bold text-gray-600">Marked for Review</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <AnsweredMarkedShape label={counts[QuestionStatus.ANSWERED_AND_MARKED_FOR_REVIEW]} className="scale-75 origin-center" />
          <span className="text-[10px] font-bold text-gray-500 leading-tight">Answered & Marked for Review (will be considered for evaluation)</span>
        </div>
      </div>

      {/* Palette Label */}
      <div className="bg-[#337ab7] text-white text-[11px] font-bold py-1 px-4 uppercase shrink-0">
        Question Palette
      </div>

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar">
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-3 justify-items-center">
          {questions.map((q, idx) => (
            <button 
                key={q.id} 
                onClick={() => onSelect(idx)}
                className={`transition-all outline-none ${currentIndex === idx ? 'ring-2 ring-[#337ab7] ring-offset-2 rounded-sm' : ''}`}
            >
              {renderShape(q.id)}
            </button>
          ))}
        </div>
      </div>

      {/* Final Sidebar Footer */}
      <div className="p-4 bg-white border-t border-[#ddd] mt-auto">
         <div className="grid grid-cols-1 gap-2">
            <button className="w-full bg-[#f2f2f2] border border-[#ccc] py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100 uppercase">Question Paper</button>
            <button className="w-full bg-[#f2f2f2] border border-[#ccc] py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100 uppercase">Instructions</button>
            <button 
              onClick={onSubmit}
              className="w-full bg-[#337ab7] hover:bg-[#286090] text-white py-3 mt-2 text-[13px] font-black uppercase rounded shadow-md transition-all active:scale-95"
            >
              Submit
            </button>
         </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
