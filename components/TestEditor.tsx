import React, { useState } from 'react';
import { Exam, Question, QuestionType, QuestionDifficulty } from '../types';
import LatexRenderer from './LatexRenderer';

interface Props {
  exam: Exam | null;
  onCancel: () => void;
  onSave: (exam: Exam) => void;
}

type PaperType = 'PAPER_1' | 'PAPER_2';

// OpenRouter Configuration using injected API Key
const OPENROUTER_MODEL = "xiaomi/mimo-v2-flash:free";

const TestEditor: React.FC<Props> = ({ exam, onCancel, onSave }) => {
  const [name, setName] = useState(exam?.name || '');
  const [duration, setDuration] = useState(exam?.durationMinutes || 180);
  const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);
  const [activeIdx, setActiveIdx] = useState(0);
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [paperType, setPaperType] = useState<PaperType>('PAPER_1');
  // Constraint: One subject at once
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');

  const subjectsOptions = paperType === 'PAPER_1' 
    ? ['Physics', 'Chemistry', 'Mathematics']
    : ['Mathematics', 'Aptitude', 'Drawing/Planning'];

  const cleanJson = (text: string) => {
    // Strips markdown code blocks if present
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  };

  const fetchFullSubject = async (subject: string): Promise<any> => {
    const prompt = `Generate a full JEE Main standard test set for ${subject}. 
    Requirements:
    1. Exactly 30 questions in total.
    2. Exactly 20 Multiple Choice Questions (Section A).
    3. Exactly 10 Numerical Answer Type (NAT) questions (Section B).
    4. Use LaTeX for ALL mathematical expressions, chemical formulas, and units ($ for inline, $$ for block).
    5. Difficulty: A balanced mix of EASY, MEDIUM, and HARD.
    6. Ensure questions are original and scientifically accurate.
    
    Response MUST be ONLY a JSON object with this exact structure:
    {
      "mcqs": [
        { "text": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "0", "difficulty": "MEDIUM" }
      ],
      "nats": [
        { "text": "...", "correctAnswer": "25.5", "difficulty": "HARD" }
      ]
    }`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Apex JEE Mock Architect"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an elite NTA JEE Main subject matter expert. You output only high-quality, valid JSON containing 30 questions per subject in one single response. No conversational text."
          },
          { role: "user", content: prompt }
        ],
        // Using high max_tokens to accommodate 30 questions in one response
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Synthesis engine error (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from synthesis engine.");
    
    try {
      return JSON.parse(cleanJson(content));
    } catch (e) {
      console.error("JSON Parse Error. Raw content:", content);
      throw new Error("Failed to parse synthesis data. The response was malformed.");
    }
  };

  const generateAI = async () => {
    setIsGenerating(true);
    let currentGlobalId = 1;

    try {
      setGenerationStatus(`Synthesizing 30 questions for ${selectedSubject}...`);
      
      const data = await fetchFullSubject(selectedSubject);
      
      const subMcqs = (data.mcqs || []).slice(0, 20).map((q: any) => ({
        ...q,
        id: currentGlobalId++,
        subject: selectedSubject as any,
        type: QuestionType.MCQ,
        section: 'A',
        difficulty: q.difficulty as QuestionDifficulty || QuestionDifficulty.MEDIUM
      }));

      const subNats = (data.nats || []).slice(0, 10).map((q: any) => ({
        ...q,
        id: currentGlobalId++,
        subject: selectedSubject as any,
        type: QuestionType.NAT,
        section: 'B',
        difficulty: q.difficulty as QuestionDifficulty || QuestionDifficulty.MEDIUM
      }));

      const finalQs = [...subMcqs, ...subNats];
      
      if (finalQs.length === 0) throw new Error("Synthesis yielded zero questions.");

      setQuestions(finalQs);
      setName(name || `JEE Power Mock - ${selectedSubject}`);
      setShowAIModal(false);
    } catch (e: any) {
      console.error("Synthesis Failure:", e);
      alert(`Synthesis Error: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
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
      <header className="bg-[#0b3c66] text-white p-4 shadow-xl flex justify-between items-center z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="bg-white/10 p-2 rounded hover:bg-white/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest leading-none mb-1">Architecture Portal</span>
            <span className="font-black text-xl uppercase tracking-tighter">Mock Architect</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAIModal(true)}
            className="bg-[#9c27b0] hover:bg-[#7b1fa2] text-white px-6 py-2 rounded text-[11px] font-black uppercase shadow-lg flex items-center gap-2 transition-all active:scale-95 border-b-4 border-purple-900"
          >
            ⚡ AI Synthesis
          </button>
          <button 
            onClick={() => {
              if(!name || questions.length === 0) return alert("Validation Error: Missing Exam Title or Question Data.");
              onSave({ id: exam?.id || Date.now().toString(), name, durationMinutes: duration, questions, createdAt: Date.now() });
            }}
            className="bg-[#5cb85c] hover:bg-[#449d44] text-white px-8 py-2 rounded text-[11px] font-black uppercase shadow-lg transition-all active:scale-95 border-b-4 border-green-700"
          >
            Deploy Assessment
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-inner">
          <div className="p-6 border-b space-y-4 bg-gray-50/50">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Title</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Exam Name" className="w-full border-2 p-3 text-xs font-bold rounded-xl outline-none focus:border-blue-500 shadow-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration (Min)</label>
              <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full border-2 p-3 text-xs font-bold rounded-xl outline-none shadow-sm" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`w-full text-left p-4 rounded-2xl text-[11px] font-bold transition-all border-2 flex items-center gap-4 ${activeIdx === i ? 'bg-[#337ab7] text-white border-[#337ab7] shadow-lg translate-x-1' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] shrink-0 font-black ${activeIdx === i ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>{q.id}</div>
                <div className="flex flex-col min-w-0">
                    <span className="truncate">{q.subject}</span>
                    <span className={`text-[8px] font-black uppercase opacity-60 ${activeIdx === i ? 'text-white' : 'text-[#337ab7]'}`}>{q.difficulty} • Sect {q.section}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#f8f9fa]">
          {currentQ ? (
            <div className="max-w-5xl mx-auto space-y-10 bg-white p-12 rounded-[2rem] border border-gray-200 shadow-2xl">
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
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Source (Markdown/LaTeX)</label>
                  <textarea 
                    value={currentQ.text}
                    onChange={e => updateQuestion({ text: e.target.value })}
                    className="w-full border-2 border-gray-100 p-6 rounded-2xl focus:border-[#337ab7] outline-none min-h-[300px] font-mono text-sm shadow-inner"
                    placeholder="Input statement..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Render Preview</label>
                  <div className="w-full bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 min-h-[300px] overflow-auto">
                    <LatexRenderer content={currentQ.text} className="text-xl text-gray-800" />
                  </div>
                </div>
              </div>

              {currentQ.type === QuestionType.MCQ && (
                <div className="space-y-8 pt-8 border-t border-gray-50">
                   <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Options Matrix</label>
                  <div className="grid gap-6">
                    {currentQ.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-6 group">
                        <button 
                          onClick={() => updateQuestion({ correctAnswer: oIdx.toString() })}
                          className={`w-14 h-14 shrink-0 rounded-2xl border-2 flex items-center justify-center font-black transition-all ${currentQ.correctAnswer === oIdx.toString() ? 'bg-green-500 border-green-500 text-white shadow-xl scale-110' : 'border-gray-100 text-gray-300 hover:border-green-200'}`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </button>
                        <div className="flex-1 flex flex-col gap-2">
                          <input value={opt} onChange={e => {
                            const newOpts = [...(currentQ.options || [])];
                            newOpts[oIdx] = e.target.value;
                            updateQuestion({ options: newOpts });
                          }} className="w-full border-b-2 border-gray-100 py-3 focus:border-[#337ab7] outline-none font-mono text-xs" />
                          <div className="p-2 bg-gray-50 rounded border border-gray-100 text-[11px]">
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
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Numerical Key</label>
                  <input 
                    value={currentQ.correctAnswer} 
                    onChange={e => updateQuestion({ correctAnswer: e.target.value })} 
                    className="w-full max-w-sm border-2 border-blue-50 bg-blue-50/20 p-6 rounded-3xl focus:border-[#337ab7] focus:bg-white outline-none font-black text-4xl text-[#337ab7] shadow-inner text-center" 
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none grayscale">
               <h3 className="text-2xl font-black text-[#0b3c66] uppercase tracking-[0.5em]">Designer Canvas</h3>
            </div>
          )}
        </main>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b3c66]/90 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-[#337ab7] p-8 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black text-2xl uppercase tracking-tighter">AI Synthesis (Mimo-v2)</h3>
              <button onClick={() => setShowAIModal(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-2xl leading-none">×</button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPaperType('PAPER_1')} className={`p-5 rounded-3xl border-2 transition-all font-bold uppercase text-[10px] tracking-widest ${paperType === 'PAPER_1' ? 'border-[#337ab7] bg-blue-50 shadow-md text-[#337ab7]' : 'border-gray-100 text-gray-400'}`}>Engineering (Paper 1)</button>
                <button onClick={() => setPaperType('PAPER_2')} className={`p-5 rounded-3xl border-2 transition-all font-bold uppercase text-[10px] tracking-widest ${paperType === 'PAPER_2' ? 'border-[#337ab7] bg-blue-50 shadow-md text-[#337ab7]' : 'border-gray-100 text-gray-400'}`}>Architecture (Paper 2)</button>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-3 tracking-widest">Select Subject for Generation</label>
                <div className="grid grid-cols-1 gap-3">
                  {subjectsOptions.map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${selectedSubject === sub ? 'border-[#337ab7] bg-blue-50 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-blue-100'}`}
                    >
                      <div className="flex flex-col text-left">
                        <span className={`text-sm font-black ${selectedSubject === sub ? 'text-[#0b3c66]' : 'text-gray-400'}`}>{sub}</span>
                        <span className="text-[9px] font-bold opacity-60 uppercase">30 Question Monolithic Set</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedSubject === sub ? 'border-[#337ab7] bg-[#337ab7]' : 'border-gray-200'}`}>
                        {selectedSubject === sub && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <button onClick={generateAI} disabled={isGenerating} className={`w-full py-6 rounded-3xl text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </div>
                  ) : 'Launch Synthesis'}
                </button>
                
                {generationStatus && (
                  <div className="text-center animate-pulse">
                    <p className="text-[10px] font-black text-[#337ab7] uppercase tracking-widest">{generationStatus}</p>
                  </div>
                )}
              </div>
              
              <p className="text-[8px] font-bold text-gray-400 uppercase text-center leading-relaxed">
                Synthesis uses OpenRouter (Mimo-v2). 20 MCQs and 10 NATs will be generated in a single API call.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEditor;