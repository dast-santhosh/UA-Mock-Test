
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import QuestionArea from './components/QuestionArea';
import QuestionPalette from './components/QuestionPalette';
import { QuestionStatus, QuestionState, AppView, Exam, Student, TestResult, QuestionType, SubmissionStage } from './types';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import TestEditor from './components/TestEditor';
import ResultView from './components/ResultView';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LANDING');
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>(SubmissionStage.IDLE);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // REAL-TIME SCORE ENGINE
  const currentLiveScore = useMemo(() => {
    if (!activeExam) return 0;
    let score = 0;
    activeExam.questions.forEach(q => {
      const state = questionStates[q.id];
      if (q.type === QuestionType.MCQ) {
        if (state?.selectedOption !== undefined) {
          if (state.selectedOption.toString() === q.correctAnswer) score += 4;
          else score -= 1;
        }
      } else {
        if (state?.numericalAnswer) {
          const provided = state.numericalAnswer.trim();
          const correct = q.correctAnswer.trim();
          if (provided === correct || parseFloat(provided) === parseFloat(correct)) score += 4;
        }
      }
    });
    return score;
  }, [activeExam, questionStates]);

  useEffect(() => {
    const unsubExams = onSnapshot(collection(db, 'exams'), (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ ...doc.data() } as Exam)));
      setIsLoading(false);
    }, (err) => console.error("Exams sync error:", err));

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ ...doc.data() } as Student)));
    }, (err) => console.error("Students sync error:", err));

    const unsubResults = onSnapshot(query(collection(db, 'results'), orderBy('timestamp', 'desc')), (snapshot) => {
      setResults(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TestResult)));
    }, (err) => console.error("Results sync error:", err));

    return () => {
      unsubExams();
      unsubStudents();
      unsubResults();
    };
  }, []);

  // MASTER TIMER
  useEffect(() => {
    if (view !== 'TEST_INTERFACE' || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest(); // Auto-submit on time up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [view, isSubmitting]);

  const saveExam = async (exam: Exam) => {
    try {
      await setDoc(doc(db, 'exams', exam.id), exam);
      setView('ADMIN_DASHBOARD');
    } catch (e) {
      console.error("Save exam error:", e);
    }
  };

  const deleteExam = async (id: string) => {
    await deleteDoc(doc(db, 'exams', id));
  };

  const saveStudent = async (student: Student) => {
    await setDoc(doc(db, 'students', student.id), student);
  };

  const deleteStudent = async (id: string) => {
    await deleteDoc(doc(db, 'students', id));
  };

  const startTest = (exam: Exam, student: Student) => {
    setActiveExam(exam);
    setLoggedInStudent(student);
    setTimeLeft(exam.durationMinutes * 60);
    setQuestionStates({});
    setCurrentIndex(0);
    setView('TEST_INTERFACE');
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // CORE SUBMISSION LOGIC
  const submitTest = async () => {
    if (!activeExam || !loggedInStudent || isSubmitting) return;
    
    setIsSubmitting(true);
    setShowSubmitModal(false);
    
    try {
      setSubmissionStage(SubmissionStage.AUDITING);
      await delay(500); 
      setSubmissionStage(SubmissionStage.MATCHING);
      await delay(500);
      setSubmissionStage(SubmissionStage.CALCULATING);
      await delay(400);
      setSubmissionStage(SubmissionStage.SYNCING);
      
      const result: Omit<TestResult, 'id'> = {
        studentId: loggedInStudent.id,
        studentName: loggedInStudent.name,
        examId: activeExam.id,
        examName: activeExam.name,
        score: currentLiveScore,
        totalQuestions: activeExam.questions.length,
        timestamp: Date.now()
      };

      try {
        await addDoc(collection(db, 'results'), result);
      } catch (e) {
        console.warn("Cloud persistence skipped.");
      }
      
      setSubmissionStage(SubmissionStage.FINALIZING);
      await delay(500);
      setView('RESULT_SUMMARY');
    } catch (error) {
      console.error("Submission error:", error);
      setView('RESULT_SUMMARY');
    } finally {
      setIsSubmitting(false);
      setSubmissionStage(SubmissionStage.IDLE);
    }
  };

  const handleFinalSubmitRequest = () => {
    if (isSubmitting) return;
    setShowSubmitModal(true);
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
      <div className="w-12 h-12 border-4 border-[#337ab7] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-black text-[#0b3c66] animate-pulse tracking-widest text-xs uppercase">Connecting to NTA Terminal...</div>
    </div>
  );

  if (view === 'LANDING') return <LandingPage onNavigate={setView} />;
  if (view === 'ADMIN_LOGIN') return <LoginPage type="ADMIN" onBack={() => setView('LANDING')} onLogin={() => setView('ADMIN_DASHBOARD')} />;
  if (view === 'STUDENT_LOGIN') return <LoginPage type="STUDENT" onBack={() => setView('LANDING')} onStartExam={startTest} exams={exams} students={students} />;
  
  if (view === 'ADMIN_DASHBOARD') return (
    <AdminDashboard exams={exams} students={students} results={results} onLogout={() => setView('LANDING')} onCreateExam={() => { setEditingExam(null); setView('TEST_EDITOR'); }} onEditExam={(exam) => { setEditingExam(exam); setView('TEST_EDITOR'); }} onDeleteExam={deleteExam} onSaveStudent={saveStudent} onDeleteStudent={deleteStudent} />
  );

  if (view === 'TEST_EDITOR') return <TestEditor exam={editingExam} onCancel={() => setView('ADMIN_DASHBOARD')} onSave={saveExam} />;

  if (view === 'RESULT_SUMMARY' && activeExam && loggedInStudent) {
    return <ResultView exam={activeExam} student={loggedInStudent} states={questionStates} onBack={() => setView('LANDING')} />;
  }

  if (view === 'TEST_INTERFACE' && activeExam) {
    const currentQuestion = activeExam.questions[currentIndex];
    const currentState = questionStates[currentQuestion.id] || { status: QuestionStatus.NOT_VISITED };

    const updateState = (qId: number, newState: Partial<QuestionState>) => {
      setQuestionStates(prev => ({ ...prev, [qId]: { ...prev[qId], ...newState } }));
    };

    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden text-[#333] relative">
        {/* CUSTOM SUBMIT CONFIRM MODAL (Replaces native confirm) */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-[#0b3c66] uppercase text-center mb-4 tracking-tighter">Submit Assessment?</h3>
              <p className="text-gray-500 text-center font-bold mb-8 leading-relaxed text-sm">You are about to finalize your test. You will not be able to return to your questions after submission. Do you wish to proceed?</p>
              <div className="flex gap-4">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl uppercase text-xs transition-all active:scale-95">Cancel</button>
                <button onClick={submitTest} className="flex-1 py-4 bg-[#ea5420] hover:bg-[#d43f0c] text-white font-black rounded-2xl uppercase text-xs transition-all shadow-lg shadow-orange-100 active:scale-95">Yes, Submit</button>
              </div>
            </div>
          </div>
        )}

        {/* SECURE SUBMISSION OVERLAY */}
        {isSubmitting && (
          <div className="absolute inset-0 z-[500] bg-[#0b3c66]/95 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-700">
            <div className="relative mb-10">
               <div className="w-32 h-32 border-[8px] border-white/5 border-t-white rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xl tabular-nums">
                 {submissionStage === SubmissionStage.AUDITING ? '15%' :
                  submissionStage === SubmissionStage.MATCHING ? '50%' :
                  submissionStage === SubmissionStage.CALCULATING ? '75%' :
                  submissionStage === SubmissionStage.SYNCING ? '90%' : '98%'}
               </div>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 animate-pulse">{submissionStage}</h2>
            <p className="text-[10px] font-black text-blue-300 tracking-[0.4em] uppercase opacity-70">Securing Session Integrity</p>
          </div>
        )}

        <Header />
        
        {/* EXAMINATION STATUS BAR */}
        <div className="bg-[#fcfcfc] border-b border-[#ddd] px-4 md:px-6 py-2.5 flex justify-between items-center shrink-0 shadow-sm z-40">
          <div className="flex items-center gap-6 text-[10px] md:text-xs">
            <div className="flex items-center">
              <span className="font-bold text-gray-400 uppercase tracking-widest mr-3">Assessment:</span> 
              <span className="font-black text-[#337ab7] uppercase truncate max-w-[180px] lg:max-w-md">{activeExam.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleFinalSubmitRequest}
              disabled={isSubmitting}
              className="bg-[#ea5420] hover:bg-[#d43f0c] text-white px-5 py-2 rounded-lg text-[11px] font-black uppercase shadow-lg transition-all active:scale-95 flex items-center gap-2 border-b-4 border-[#a8320a] group"
            >
              <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              Complete the Test
            </button>

            <div className="bg-white border-2 border-[#ea5420] px-4 md:px-7 py-1 rounded-lg shadow-inner flex flex-col items-center min-w-[110px] md:min-w-[140px]">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-0.5 opacity-60">Time Left</span>
              <span className="text-xl md:text-2xl font-bold text-[#ea5420] tabular-nums leading-tight tracking-tight">
                {Math.floor(timeLeft / 3600).toString().padStart(2, '0')}:
                {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 flex flex-col min-w-0">
            <QuestionArea 
              fontSize={15}
              question={currentQuestion}
              state={currentState}
              isSubmitting={isSubmitting}
              submissionStage={submissionStage}
              onSelectOption={(idx) => !isSubmitting && updateState(currentQuestion.id, { selectedOption: idx, status: QuestionStatus.ANSWERED })}
              onSetNumerical={(val) => !isSubmitting && updateState(currentQuestion.id, { numericalAnswer: val, status: QuestionStatus.ANSWERED })}
              onClear={() => !isSubmitting && updateState(currentQuestion.id, { selectedOption: undefined, numericalAnswer: undefined, status: QuestionStatus.NOT_ANSWERED })}
              onSaveNext={() => { 
                if (isSubmitting) return;
                const hasAnswer = currentState.selectedOption !== undefined || (currentState.numericalAnswer && currentState.numericalAnswer.trim().length > 0);
                updateState(currentQuestion.id, { status: hasAnswer ? QuestionStatus.ANSWERED : QuestionStatus.NOT_ANSWERED }); 
                if (currentIndex < activeExam.questions.length - 1) setCurrentIndex(currentIndex + 1); 
              }}
              onSaveMark={() => { 
                if (isSubmitting) return;
                const hasAnswer = currentState.selectedOption !== undefined || (currentState.numericalAnswer && currentState.numericalAnswer.trim().length > 0);
                updateState(currentQuestion.id, { status: hasAnswer ? QuestionStatus.ANSWERED_AND_MARKED_FOR_REVIEW : QuestionStatus.MARKED_FOR_REVIEW }); 
                if (currentIndex < activeExam.questions.length - 1) setCurrentIndex(currentIndex + 1); 
              }}
              onMarkNext={() => { 
                if (isSubmitting) return;
                updateState(currentQuestion.id, { status: QuestionStatus.MARKED_FOR_REVIEW }); 
                if (currentIndex < activeExam.questions.length - 1) setCurrentIndex(currentIndex + 1); 
              }}
              onBack={() => !isSubmitting && currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              onNext={() => !isSubmitting && currentIndex < activeExam.questions.length - 1 && setCurrentIndex(currentIndex + 1)}
              onSubmit={handleFinalSubmitRequest}
            />
          </main>
          <aside className="w-[300px] lg:w-[340px] shrink-0 hidden md:block border-l border-[#ddd]">
            <QuestionPalette questions={activeExam.questions} questionStates={questionStates} currentIndex={currentIndex} onSelect={(idx) => !isSubmitting && setCurrentIndex(idx)} />
          </aside>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
