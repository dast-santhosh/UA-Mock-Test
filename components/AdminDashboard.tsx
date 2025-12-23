
import React, { useState } from 'react';
import { Exam, Student, TestResult } from '../types';

interface Props {
  exams: Exam[];
  students: Student[];
  results: TestResult[];
  onLogout: () => void;
  onCreateExam: () => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  exams, students, results, onLogout, onCreateExam, onEditExam, onDeleteExam, onSaveStudent, onDeleteStudent 
}) => {
  const [activeTab, setActiveTab] = useState<'EXAMS' | 'STUDENTS' | 'RESULTS'>('EXAMS');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'EXAM' | 'STUDENT' } | null>(null);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentRoll) return;
    onSaveStudent({ id: Date.now().toString(), name: newStudentName, rollNumber: newStudentRoll });
    setNewStudentName(''); setNewStudentRoll('');
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'EXAM') onDeleteExam(deleteConfirm.id);
    else onDeleteStudent(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative">
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[1.5rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900 uppercase mb-2 tracking-tight">Confirm Deletion?</h3>
            <p className="text-gray-500 text-sm font-bold mb-8">This action is permanent and cannot be reversed. Are you sure you want to proceed?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl uppercase text-[10px] tracking-widest transition-all">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-100">Delete</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#0b3c66] text-white p-4 flex justify-between items-center shadow-lg shrink-0 z-50">
        <div className="flex items-center gap-3">
          <img src="https://uniqueachievers.com/assets/img/logo-one.png" className="h-10 bg-white p-1 rounded" alt="Logo" />
          <div className="flex flex-col leading-none">
            <span className="font-black text-xl tracking-tighter uppercase">APEX ADMIN</span>
            <span className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Portal V2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex bg-white/10 rounded-xl p-1 gap-1">
            {['EXAMS', 'STUDENTS', 'RESULTS'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 text-[10px] font-black uppercase transition-all rounded-lg ${activeTab === tab ? 'bg-white text-[#0b3c66] shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-xs font-black uppercase shadow-md transition-all active:scale-95">Logout</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fa] p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'EXAMS' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-[#0b3c66] uppercase tracking-tighter">Exam Repository</h2>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Draft, Modify and Deploy Mock Assessments</p>
                </div>
                <button 
                  onClick={onCreateExam} 
                  className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-3 rounded-xl font-black uppercase text-xs shadow-xl transition-all transform hover:-translate-y-1"
                >
                  + Add New Test
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr><th className="px-8 py-5">Examination Identifier</th><th className="px-8 py-5">Stream</th><th className="px-8 py-5 text-center">Questions</th><th className="px-8 py-5 text-right">Operations</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {exams.length === 0 ? (
                      <tr><td colSpan={4} className="py-24 text-center text-gray-300 font-black uppercase tracking-widest text-sm">Vault Empty - Deploy New Exam</td></tr>
                    ) : exams.map(exam => (
                      <tr key={exam.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-black text-[#337ab7] text-base">{exam.name}</div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase mt-1">Ref ID: {exam.id}</div>
                        </td>
                        <td className="px-8 py-6"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">JEE MAIN</span></td>
                        <td className="px-8 py-6 text-center font-black text-gray-700">{exam.questions.length}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => onEditExam(exam)} className="text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-black uppercase text-[10px] border border-blue-100">Edit</button>
                            <button onClick={() => setDeleteConfirm({ id: exam.id, type: 'EXAM' })} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-black uppercase text-[10px] border border-red-100">Purge</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'STUDENTS' && (
            <div className="grid lg:grid-cols-3 gap-10 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 h-fit sticky top-0">
                <h3 className="text-xl font-black text-[#0b3c66] uppercase mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#337ab7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  New Student
                </h3>
                <form onSubmit={handleAddStudent} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Candidate Full Name</label>
                    <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="e.g. Aryan Sharma" className="w-full border-2 border-gray-50 bg-gray-50/50 p-3 rounded-xl focus:border-[#337ab7] focus:bg-white outline-none text-sm font-bold transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Authorization ID / Roll No</label>
                    <input value={newStudentRoll} onChange={e => setNewStudentRoll(e.target.value)} placeholder="e.g. NTA-9902" className="w-full border-2 border-gray-50 bg-gray-50/50 p-3 rounded-xl focus:border-[#337ab7] focus:bg-white outline-none text-sm font-bold transition-all" />
                  </div>
                  <button type="submit" className="w-full bg-[#5cb85c] hover:bg-[#449d44] text-white py-4 rounded-xl font-black uppercase text-xs shadow-lg shadow-green-200 transition-all active:scale-[0.98]">Authorize Candidate</button>
                </form>
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Authorized Database</h3>
                  <span className="bg-blue-600 text-white text-[9px] px-3 py-1 rounded-full font-black">{students.length} ACTIVE</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b">
                      <tr><th className="px-8 py-4 text-left">Credential</th><th className="px-8 py-4 text-left">Identity</th><th className="px-8 py-4 text-right">Control</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 font-mono text-xs font-black text-blue-600">{s.rollNumber}</td>
                          <td className="px-8 py-5 text-sm font-black text-gray-700">{s.name}</td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => setDeleteConfirm({ id: s.id, type: 'STUDENT' })} className="text-red-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'RESULTS' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-8">
              <div className="flex items-end gap-4">
                 <h2 className="text-3xl font-black text-[#0b3c66] uppercase tracking-tighter leading-none">Global Performance</h2>
                 <div className="h-6 w-px bg-gray-200"></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Real-time Result Reflection</p>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest border-b text-gray-400">
                    <tr>
                      <th className="px-8 py-5">Candidate Name</th>
                      <th className="px-8 py-5">Assessment Title</th>
                      <th className="px-8 py-5 text-center">Outcome Score</th>
                      <th className="px-8 py-5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.length === 0 ? (
                      <tr><td colSpan={4} className="py-24 text-center text-gray-300 font-black uppercase tracking-widest text-sm italic">Synchronizing... No records available.</td></tr>
                    ) : (
                      results.map(r => (
                        <tr key={r.id} className="hover:bg-blue-50/20 transition-all">
                          <td className="px-8 py-6 font-black text-gray-800 text-sm">{r.studentName}</td>
                          <td className="px-8 py-6 font-bold text-gray-500 text-xs uppercase">{r.examName}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`inline-block px-4 py-1.5 rounded-full font-black text-xs shadow-sm ${r.score >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {r.score > 0 ? `+${r.score}` : r.score} PTS
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right text-[10px] text-gray-400 font-black uppercase">
                            {new Date(r.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
