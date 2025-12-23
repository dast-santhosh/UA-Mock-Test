
import React from 'react';
import { Question, QuestionStatus, QuestionState } from '../types';
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
  onSelect: (index: number) => void;
}

const QuestionPalette: React.FC<Props> = ({ questions, questionStates, currentIndex, onSelect }) => {
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
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Legend / Summary Section */}
      <div className="p-2 border-b border-[#ddd] bg-white sticky top-0 z-10 shrink-0">
        <div className="text-[10px] font-bold text-[#337ab7] border-b border-[#eee] pb-1 mb-2 uppercase">Question Palette</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          <div className="flex items-center gap-1">
            <NotVisitedShape label={counts[QuestionStatus.NOT_VISITED]} className="scale-[0.6] origin-left" />
            <span className="text-[10px] text-gray-600 font-bold">Not Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <NotAnsweredShape label={counts[QuestionStatus.NOT_ANSWERED]} className="scale-[0.6] origin-left" />
            <span className="text-[10px] text-gray-600 font-bold">Not Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <AnsweredShape label={counts[QuestionStatus.ANSWERED]} className="scale-[0.6] origin-left" />
            <span className="text-[10px] text-gray-600 font-bold">Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <MarkedForReviewShape label={counts[QuestionStatus.MARKED_FOR_REVIEW]} className="scale-[0.6] origin-left" />
            <span className="text-[10px] text-gray-600 font-bold">Review</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <AnsweredMarkedShape label={counts[QuestionStatus.ANSWERED_AND_MARKED_FOR_REVIEW]} className="scale-[0.6] origin-left" />
          <span className="text-[9px] text-gray-500 font-bold italic">Answered & Marked for Review</span>
        </div>
      </div>

      <div className="bg-[#4d94d1] text-white text-[11px] font-bold py-1.5 px-3 uppercase shrink-0">
        Questions
      </div>

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50 custom-scrollbar">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 justify-items-center">
          {questions.map((q, idx) => (
            <button 
                key={q.id} 
                onClick={() => onSelect(idx)}
                className={`transition-all outline-none ${currentIndex === idx ? 'ring-2 ring-blue-600 ring-offset-1 rounded-sm' : ''}`}
            >
              {renderShape(q.id)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
