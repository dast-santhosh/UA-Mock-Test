
import React from 'react';
import { Exam, Student, QuestionState, QuestionType, QuestionDifficulty } from '../types';
import LatexRenderer from './LatexRenderer';

interface Props {
  exam: Exam;
  student: Student;
  states: Record<number, QuestionState>;
  onBack: () => void;
}

const ResultView: React.FC<Props> = ({ exam, student, states, onBack }) => {
  const calculateStats = () => {
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    exam.questions.forEach(q => {
      const s = states[q.id];
      if (q.type === QuestionType.MCQ) {
        if (s?.selectedOption === undefined) unattempted++;
        else if (s.selectedOption.toString() === q.correctAnswer) {
          score += 4;
          correct++;
        } else {
          score -= 1;
          incorrect++;
        }
      } else {
        if (!s?.numericalAnswer) unattempted++;
        else {
          const provided = s.numericalAnswer.trim();
          const target = q.correctAnswer.trim();
          if (provided === target || parseFloat(provided) === parseFloat(target)) {
            score += 4;
            correct++;
          } else {
            incorrect++;
          }
        }
      }
    });

    return { score, correct, incorrect, unattempted, total: exam.questions.length };
  };

  const stats = calculateStats();
  const accuracy = stats.correct + stats.incorrect > 0 
    ? ((stats.correct / (stats.correct + stats.incorrect)) * 100).toFixed(1)
    : "0";

  const getDifficultyColor = (diff: QuestionDifficulty) => {
    switch(diff) {
      case QuestionDifficulty.EASY: return 'text-emerald-500';
      case QuestionDifficulty.MEDIUM: return 'text-amber-500';
      case QuestionDifficulty.HARD: return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-y-auto custom-scrollbar p-4 md:p-8">
      {/* Header Info */}
      <div className="max-w-5xl mx-auto w-full mb-8 no-print">
        <div className="flex justify-between items-center mb-6">
           <button onClick={onBack} className="flex items-center gap-2 text-[#0b3c66] font-black uppercase text-xs hover:text-blue-700 transition-colors">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Exit Review
           </button>
           <button onClick={() => window.print()} className="bg-[#337ab7] text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
             Print Full Report
           </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="bg-[#0b3c66] p-8 text-white md:w-1/3 flex flex-col justify-center border-r-4 border-blue-400">
             <span className="text-blue-300 font-black uppercase text-[10px] tracking-[0.3em] mb-2">Aggregate Outcome</span>
             <h2 className="text-5xl font-black tracking-tighter mb-1">{stats.score} <span className="text-xl opacity-40">PTS</span></h2>
             <p className="text-sm font-bold opacity-70 uppercase tracking-widest">{student.name}</p>
             <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase opacity-60">Verified NTA Pattern</span>
             </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
             {[
               { label: 'Correct Responses', val: stats.correct, color: 'text-green-600' },
               { label: 'Incorrect Hits', val: stats.incorrect, color: 'text-red-500' },
               { label: 'Unattempted', val: stats.unattempted, color: 'text-gray-400' },
               { label: 'Neural Accuracy', val: `${accuracy}%`, color: 'text-blue-600' }
             ].map((item, i) => (
               <div key={i} className="bg-white p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</span>
                  <span className={`text-2xl font-black ${item.color}`}>{item.val}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-4 no-print">
          <div className="h-px bg-gray-200 flex-1"></div>
          Detailed Post-Assessment Audit
          <div className="h-px bg-gray-200 flex-1"></div>
        </h3>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-10 border-b-2 border-black pb-6">
          <h1 className="text-3xl font-black uppercase">{exam.name} - Result Report</h1>
          <p className="text-lg font-bold">Candidate: {student.name} ({student.rollNumber})</p>
          <p className="mt-2 font-black">FINAL SCORE: {stats.score} / {exam.questions.length * 4}</p>
        </div>

        {exam.questions.map((q, idx) => {
          const s = states[q.id];
          let isCorrect = false;
          let isAttempted = false;

          if (q.type === QuestionType.MCQ) {
            isAttempted = s?.selectedOption !== undefined;
            isCorrect = isAttempted && s?.selectedOption?.toString() === q.correctAnswer;
          } else {
            isAttempted = !!s?.numericalAnswer;
            const prov = s?.numericalAnswer?.trim() || "";
            const targ = q.correctAnswer.trim();
            isCorrect = isAttempted && (prov === targ || parseFloat(prov) === parseFloat(targ));
          }

          return (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden break-inside-avoid mb-6">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="font-black text-[#0b3c66] text-xs">QUESTION {q.id}</span>
                  <span className={`text-[9px] font-black uppercase ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                </div>
                <div>
                  {!isAttempted ? (
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">Not Attempted (0)</span>
                  ) : isCorrect ? (
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full">Correct (+4)</span>
                  ) : (
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-100 px-3 py-1 rounded-full">Incorrect (-1)</span>
                  )}
                </div>
              </div>

              <div className="p-8">
                 <div className="text-gray-800 font-bold mb-6 text-sm leading-relaxed">
                   <LatexRenderer content={q.text} />
                 </div>

                 {q.type === QuestionType.MCQ ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {q.options?.map((opt, oIdx) => {
                       const isSelected = s?.selectedOption === oIdx;
                       const isAnswer = q.correctAnswer === oIdx.toString();
                       
                       let borderColor = 'border-gray-100';
                       let bgColor = 'bg-gray-50/50';
                       
                       if (isAnswer) { borderColor = 'border-green-500'; bgColor = 'bg-green-50/50'; }
                       else if (isSelected) { borderColor = 'border-red-400'; bgColor = 'bg-red-50/30'; }

                       return (
                         <div key={oIdx} className={`p-4 rounded-xl border-2 ${borderColor} ${bgColor} flex items-center gap-4`}>
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isAnswer ? 'bg-green-500 text-white' : isSelected ? 'bg-red-400 text-white' : 'bg-white border text-gray-400'}`}>
                             {String.fromCharCode(65 + oIdx)}
                           </div>
                           <div className="text-xs font-bold text-gray-700">
                             <LatexRenderer content={opt} />
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                         <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Candidate Input</span>
                         <span className="text-xl font-black text-[#0b3c66]">{s?.numericalAnswer || '--'}</span>
                      </div>
                      <div className="flex-1 bg-green-50 p-6 rounded-2xl border border-dashed border-green-200">
                         <span className="block text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Standard Key</span>
                         <span className="text-xl font-black text-green-700">{q.correctAnswer}</span>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 mb-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest no-print">
        End of Analysis • Wisdom is Immortal
      </div>
    </div>
  );
};

export default ResultView;
