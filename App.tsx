import React, { useState, useEffect, useMemo } from 'react';
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

  // Extract unique subjects for tabs
  const subjects = useMemo(() => {
    if (!activeExam) return [];
    const subs: string[] = [];
    activeExam.questions.forEach(q => {
      if (!subs.includes(q.subject)) subs.push(q.subject);
    });
    return subs;
  }, [activeExam]);

  const currentSubject = activeExam?.questions[currentIndex]?.subject;

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

  useEffect(() => {
    if (view !== 'TEST_INTERFACE' || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [view, isSubmitting]);

  const submitTest = async () => {
    if (!activeExam || !loggedInStudent || isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);
    try {
      setSubmissionStage(SubmissionStage.AUDITING);
      await new Promise(r => setTimeout(r, 1000));
      setSubmissionStage(SubmissionStage.MATCHING);
      await new Promise(r => setTimeout(r, 1000));
      setSubmissionStage(SubmissionStage.CALCULATING);
      const result: Omit<TestResult, 'id'> = {
        studentId: loggedInStudent.id,
        studentName: loggedInStudent.name,
        examId: activeExam.id,
        examName: activeExam.name,
        score: currentLiveScore,
        totalQuestions: activeExam.questions.length,
        timestamp: Date.now()
      };
      await addDoc(collection(db, 'results'), result);
      setSubmissionStage(SubmissionStage.FINALIZING);
      setView('RESULT_SUMMARY');
    } catch (error) {
      console.error("Submission error:", error);
      setView('RESULT_SUMMARY');
    } finally {
      setIsSubmitting(false);
      setSubmissionStage(SubmissionStage.IDLE);
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="w-10 h-10 border-4 border-[#337ab7] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (view === 'LANDING') return <LandingPage onNavigate={setView} />;
  if (view === 'ADMIN_LOGIN') return <LoginPage type="ADMIN" onBack={() => setView('LANDING')} onLogin={() => setView('ADMIN_DASHBOARD')} />;
  if (view === 'STUDENT_LOGIN') return <LoginPage type="STUDENT" onBack={() => setView('LANDING')} onStartExam={(exam, student) => {
    setActiveExam(exam);
    setLoggedInStudent(student);
    setTimeLeft(exam.durationMinutes * 60);
    setQuestionStates({});
    setCurrentIndex(0);
    setView('TEST_INTERFACE');
  }} exams={exams} students={students} />;
  
  if (view === 'ADMIN_DASHBOARD') return (
    <AdminDashboard exams={exams} students={students} results={results} onLogout={() => setView('LANDING')} onCreateExam={() => { setEditingExam(null); setView('TEST_EDITOR'); }} onEditExam={(exam) => { setEditingExam(exam); setView('TEST_EDITOR'); }} onDeleteExam={id => deleteDoc(doc(db, 'exams', id))} onSaveStudent={s => setDoc(doc(db, 'students', s.id), s)} onDeleteStudent={id => deleteDoc(doc(db, 'students', id))} />
  );

  if (view === 'TEST_EDITOR') return <TestEditor exam={editingExam} onCancel={() => setView('ADMIN_DASHBOARD')} onSave={e => setDoc(doc(db, 'exams', e.id), e).then(() => setView('ADMIN_DASHBOARD'))} />;

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
      <div className="flex flex-col h-screen bg-white overflow-hidden text-[#333]">
        <Header />
        
        {/* Exam Control Bar */}
        <div className="bg-[#fcfcfc] border-b border-[#ddd] px-4 py-2 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">Exam Name</span>
            <span className="text-[14px] font-black text-[#0b3c66]">{activeExam.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Time Left</span>
              <div className="bg-[#337ab7] text-white px-4 py-1 rounded font-bold text-xl tabular-nums">
                {Math.floor(timeLeft / 3600).toString().padStart(2, '0')}:
                {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Subject Navigation Tabs - Exactly like NTA */}
        <div className="bg-[#f0f0f0] border-b border-[#ddd] px-1 pt-1 flex gap-1 shrink-0 overflow-x-auto no-scrollbar">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => {
                const firstIdx = activeExam.questions.findIndex(q => q.subject === sub);
                if (firstIdx !== -1) setCurrentIndex(firstIdx);
              }}
              className={`px-6 py-2 text-[11px] font-bold uppercase transition-all rounded-t border-t border-x ${currentSubject === sub ? 'bg-white border-[#ddd] text-[#337ab7]' : 'bg-[#e4e4e4] border-transparent text-gray-500 hover:bg-[#e9e9e9]'}`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 flex flex-col min-w-0">
            <QuestionArea 
              fontSize={14}
              question={currentQuestion}
              state={currentState}
              isSubmitting={isSubmitting}
              onSelectOption={(idx) => !isSubmitting && updateState(currentQuestion.id, { selectedOption: idx, status: QuestionStatus.ANSWERED })}
              onSetNumerical={(val) => !isSubmitting && updateState(currentQuestion.id, { numericalAnswer: val, status: QuestionStatus.ANSWERED })}
              onClear={() => !isSubmitting && updateState(currentQuestion.id, { selectedOption: undefined, numericalAnswer: undefined, status: QuestionStatus.NOT_ANSWERED })}
              onSaveNext={() => { 
                const hasAnswer = currentState.selectedOption !== undefined || !!currentState.numericalAnswer;
                updateState(currentQuestion.id, { status: hasAnswer ? QuestionStatus.ANSWERED : QuestionStatus.NOT_ANSWERED }); 
                if (currentIndex < activeExam.questions.length - 1) setCurrentIndex(currentIndex + 1); 
              }}
              onSaveMark={() => { 
                const hasAnswer = currentState.selectedOption !== undefined || !!currentState.numericalAnswer;
                updateState(currentQuestion.id, { status: hasAnswer ? QuestionStatus.ANSWERED_AND_MARKED_FOR_REVIEW : QuestionStatus.MARKED_FOR_REVIEW }); 
                if (currentIndex < activeExam.questions.length - 1) setCurrentIndex(currentIndex + 1); 
              }}
              onMarkNext={() => { 
                updateState(currentQuestion.id, { status: QuestionStatus.MARKED_FOR_REVIEW }); 
                if (currentIndex < activeExam.questions.length - 1) setCurrentIndex(currentIndex + 1); 
              }}
              onBack={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              onNext={() => currentIndex < activeExam.questions.length - 1 && setCurrentIndex(currentIndex + 1)}
              onSubmit={() => setShowSubmitModal(true)}
            />
          </main>
          <aside className="w-[300px] shrink-0 hidden md:block">
            <QuestionPalette 
              questions={activeExam.questions} 
              questionStates={questionStates} 
              currentIndex={currentIndex} 
              student={loggedInStudent}
              onSelect={setCurrentIndex} 
              onSubmit={() => setShowSubmitModal(true)}
            />
          </aside>
        </div>

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded p-8 max-w-sm w-full shadow-2xl text-center">
              <h3 className="text-xl font-bold text-[#0b3c66] mb-4">CONFIRM SUBMISSION</h3>
              <p className="text-gray-600 mb-8 text-sm">Are you sure you want to submit the test? You will not be able to change your answers after submission.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded uppercase text-xs transition-all">No, Cancel</button>
                <button onClick={submitTest} className="flex-1 py-3 bg-[#ea5420] hover:bg-[#d43f0c] text-white font-bold rounded uppercase text-xs transition-all">Yes, Submit</button>
              </div>
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#337ab7] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-black text-[#0b3c66] uppercase">{submissionStage}</h2>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default App;