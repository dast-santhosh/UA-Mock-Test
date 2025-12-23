
import React, { useState } from 'react';
import { Exam, Question, QuestionType, QuestionDifficulty } from '../types';
import LatexRenderer from './LatexRenderer';

interface Props {
  exam: Exam | null;
  onCancel: () => void;
  onSave: (exam: Exam) => void;
}

type PaperType = 'PAPER_1' | 'PAPER_2';

const TestEditor: React.FC<Props> = ({ exam, onCancel, onSave }) => {
  const [name, setName] = useState(exam?.name || '');
  const [duration, setDuration] = useState(exam?.durationMinutes || 180);
  const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);
  const [activeIdx, setActiveIdx] = useState(0);
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paperType, setPaperType] = useState<PaperType>('PAPER_1');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Physics', 'Chemistry', 'Mathematics']);

  const subjectsOptions = paperType === 'PAPER_1' 
    ? ['Physics', 'Chemistry', 'Mathematics']
    : ['Mathematics', 'Aptitude', 'Drawing/Planning'];

  const handleSubjectToggle = (sub: string) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  // Helper for exponential backoff retries to handle OpenRouter rate limits or transient errors
  const fetchWithRetry = async (fn: () => Promise<Response>, retries = 3, delay = 2000): Promise<Response> => {
    const res = await fn();
    if (res.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${res.status}`);
    }
    return res;
  };

  const generateAI = async () => {
    if (selectedSubjects.length === 0) return alert("Select at least one subject.");
    
    // Using process.env.API_KEY as the centralized secret source
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("System Error: API_KEY environment variable is not defined.");
      return;
    }

    setIsGenerating(true);
    
    try {
      let allQuestions: Question[] = [];
      let currentGlobalId = 1;

      for (const sub of selectedSubjects) {
        const prompt = `Act as an elite Subject Matter Expert for the NTA JEE Main Examination. 
        Synthesize a rigorous set of exactly 30 questions for the subject: ${sub}.
        
        PATTERN REQUIREMENTS:
        - SECTION A: 20 Multiple Choice Questions (Single Correct). 
        - SECTION B: 10 Numerical Answer Types (NAT).
        
        SYLLABUS DEPTH:
        - MATHEMATICS: Emphasize Calculus (Differential/Integral), Vectors, 3D Geometry, and Probability.
        - PHYSICS: Focus on Mechanics, Electrodynamics, Modern Physics, and Thermodynamics.
        - CHEMISTRY: Focus on Organic Synthesis Mechanisms, Chemical Bonding, and Equilibrium.
        
        FORMATTING RULES:
        - LATEX: Use LaTeX for ALL mathematical symbols, units, and equations ($ for inline, $$ for block).
        - DIFFICULTY: Distribution of 20% Easy, 60% Medium, 20% Hard.
        - OUTPUT: Strictly JSON.
        
        JSON SCHEMA:
        {
          "mcqs": [{"text": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "0-3", "difficulty": "EASY|MEDIUM|HARD"}],
          "nats": [{"text": "...", "correctAnswer": "numerical_value", "difficulty": "EASY|MEDIUM|HARD"}]
        }`;

        const response = await fetchWithRetry(() => 
          fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": window.location.origin,
              "X-Title": "NTA Mock Test Architect",
            },
            body: JSON.stringify({
              "model": "xiaomi/mimo-v2-flash:free",
              "messages": [
                { "role": "system", "content": "You are a specialized exam generator. Always output valid JSON." },
                { "role": "user", "content": prompt }
              ],
              "response_format": { "type": "json_object" }
            })
          })
        );

        const result = await response.json();
        const content = result.choices[0].message.content;
        const data = JSON.parse(content || '{}');
        
        const subMcqs = (data.mcqs || []).map((q: any) => ({
          ...q,
          id: currentGlobalId++,
          subject: sub as any,
          type: QuestionType.MCQ,
          section: 'A'
        }));
        
        const subNats = (data.nats || []).map((q: any) => ({
          ...q,
          id: currentGlobalId++,
          subject: sub as any,
          type: QuestionType.NAT,
          section: 'B'
        }));

        allQuestions = [...allQuestions, ...subMcqs, ...subNats];
      }

      setQuestions(allQuestions);
      setName(name || `JEE-MAIN Full Mock - ${new Date().toLocaleDateString('en-IN')}`);
      setShowAIModal(false);
      alert(`Successfully synthesized ${allQuestions.length} questions across ${selectedSubjects.length} subjects.`);
    } catch (e: any) {
      console.error("OpenRouter Synthesis Fault:", e);
      alert(`Synthesis failed: ${e.message || "Unknown error"}. Please verify your API configuration.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateQuestion = (updates: Partial<Question>) => {
    const newQs = [...questions];
    newQs[activeIdx] = { ...newQs[activeIdx], ...updates };
    setQuestions(newQs);
  };

  const currentQ = questions[activeIdx];

  const getDifficultyColor = (diff: QuestionDifficulty) => {
    switch(diff) {
      case QuestionDifficulty.EASY: return 'bg-emerald-500';
      case QuestionDifficulty.MEDIUM: return 'bg-amber-500';
      case QuestionDifficulty.HARD: return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="bg-[#0b3c66] text-white p-4 shadow-xl flex justify-between items-center z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="bg-white/10 p-2 rounded hover:bg-white/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest leading-none mb-1">Architecture Portal</span>
            <span className="font-black text-xl uppercase tracking-tighter">Exam Architect</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAIModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-[11px] font-black uppercase shadow-lg flex items-center gap-2 transition-all active:scale-95 border-b-4 border-purple-800"
          >
            ⚡ AI Generative Tool
          </button>
          <button 
            onClick={() => {
              if(!name || questions.length === 0) return alert("Validation Failed: Empty Exam Container");
              onSave({ id: exam?.id || Date.now().toString(), name, durationMinutes: duration, questions, createdAt: Date.now() });
            }}
            className="bg-[#5cb85c] hover:bg-[#449d44] text-white px-8 py-2 rounded-xl text-[11px] font-black uppercase shadow-lg transition-all active:scale-95 border-b-4 border-green-700"
          >
            Deploy Assessment
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-inner">
          <div className="p-6 border-b space-y-4 bg-gray-50/50">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject Metadata</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Exam Title" className="w-full border-2 p-3 text-xs font-bold rounded-xl outline-none focus:border-blue-500 shadow-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time Constraint (Min)</label>
              <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full border-2 p-3 text-xs font-bold rounded-xl outline-none shadow-sm" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`w-full text-left p-4 rounded-2xl text-xs font-bold transition-all border-2 flex items-center gap-4 ${activeIdx === i ? 'bg-[#337ab7] text-white border-[#337ab7] shadow-xl translate-x-1' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-black ${activeIdx === i ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>{q.id}</div>
                <div className="flex flex-col">
                    <span className="truncate w-[180px] text-left">{q.subject}</span>
                    <span className={`text-[8px] font-black uppercase opacity-60 ${activeIdx === i ? 'text-white' : 'text-[#337ab7]'}`}>{q.difficulty} • Sect {q.section}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#f8f9fa]">
          {currentQ ? (
            <div className="max-w-5xl mx-auto space-y-10 bg-white p-12 rounded-[2rem] border border-gray-100 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-50 pb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-[#0b3c66] text-white px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg">Question {currentQ.id}</div>
                  <select 
                    value={currentQ.difficulty} 
                    onChange={e => updateQuestion({ difficulty: e.target.value as any })}
                    className={`text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full border-none outline-none cursor-pointer ${getDifficultyColor(currentQ.difficulty)}`}
                  >
                    {Object.values(QuestionDifficulty).map(d => <option key={d} value={d} className="bg-white text-gray-700">{d}</option>)}
                  </select>
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentQ.subject} • SECTION {currentQ.section}</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Markdown & Latex Editor</label>
                  <textarea 
                    value={currentQ.text}
                    onChange={e => updateQuestion({ text: e.target.value })}
                    className="w-full border-2 border-gray-100 p-6 rounded-2xl focus:border-[#337ab7] outline-none min-h-[250px] font-mono text-sm shadow-inner"
                    placeholder="Enter statement with LaTeX..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Visual Sanitization</label>
                  <div className="w-full bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 min-h-[250px] overflow-auto">
                    <LatexRenderer content={currentQ.text} className="text-xl text-gray-800" />
                  </div>
                </div>
              </div>

              {currentQ.type === QuestionType.MCQ && (
                <div className="space-y-8 pt-8 border-t border-gray-50">
                   <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Options Matrix</label>
                  <div className="grid gap-6">
                    {currentQ.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-6 group">
                        <button 
                          onClick={() => updateQuestion({ correctAnswer: oIdx.toString() })}
                          className={`w-14 h-14 shrink-0 rounded-2xl border-2 flex items-center justify-center font-black transition-all ${currentQ.correctAnswer === oIdx.toString() ? 'bg-green-500 border-green-500 text-white shadow-xl scale-110' : 'border-gray-100 text-gray-300 hover:border-green-200'}`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </button>
                        <div className="flex-1 flex gap-4">
                          <input value={opt} onChange={e => {
                            const newOpts = [...(currentQ.options || [])];
                            newOpts[oIdx] = e.target.value;
                            updateQuestion({ options: newOpts });
                          }} className="flex-1 border-b-2 border-gray-50 py-4 focus:border-[#337ab7] outline-none font-mono text-xs" />
                          <div className="w-1/3 p-2 bg-gray-50 rounded border text-sm overflow-hidden flex items-center">
                            <LatexRenderer content={opt} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.type === QuestionType.NAT && (
                <div className="space-y-6 pt-8 border-t border-gray-50">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Correct Numerical Value</label>
                  <input 
                    value={currentQ.correctAnswer} 
                    onChange={e => updateQuestion({ correctAnswer: e.target.value })} 
                    className="w-full max-w-sm border-2 border-blue-50 bg-blue-50/20 p-6 rounded-3xl focus:border-[#337ab7] focus:bg-white outline-none font-black text-3xl text-[#337ab7] shadow-inner text-center" 
                    placeholder="Enter value..."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
               <h3 className="text-xl font-black text-[#0b3c66] uppercase tracking-[0.4em]">Draft Workspace</h3>
            </div>
          )}
        </main>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b3c66]/80 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-[#337ab7] p-8 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black text-2xl uppercase tracking-tighter">AI Synthesis Tool</h3>
              <button onClick={() => setShowAIModal(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-2xl leading-none">×</button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPaperType('PAPER_1')} className={`p-5 rounded-3xl border-2 transition-all font-bold uppercase text-xs tracking-widest ${paperType === 'PAPER_1' ? 'border-[#337ab7] bg-blue-50 shadow-md text-[#337ab7]' : 'border-gray-100 text-gray-400'}`}>B.E. / B.Tech</button>
                <button onClick={() => setPaperType('PAPER_2')} className={`p-5 rounded-3xl border-2 transition-all font-bold uppercase text-xs tracking-widest ${paperType === 'PAPER_2' ? 'border-[#337ab7] bg-blue-50 shadow-md text-[#337ab7]' : 'border-gray-100 text-gray-400'}`}>B.Arch / B.Plan</button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {subjectsOptions.map(sub => (
                  <label key={sub} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl cursor-pointer hover:bg-white transition-all border-2 border-transparent has-[:checked]:border-[#337ab7] has-[:checked]:bg-blue-50">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#0b3c66]">{sub}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">20 MCQ + 10 NAT Pattern</span>
                    </div>
                    <input type="checkbox" checked={selectedSubjects.includes(sub)} onChange={() => handleSubjectToggle(sub)} className="w-6 h-6 accent-[#337ab7]" />
                  </label>
                ))}
              </div>

              <button onClick={generateAI} disabled={isGenerating} className={`w-full py-6 rounded-3xl text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Synthesizing Neural Matrix...
                  </div>
                ) : 'Launch AI Architect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEditor;
