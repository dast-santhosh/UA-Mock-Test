
import React, { useState } from 'react';
import { Exam, Student } from '../types';

interface Props {
  type: 'ADMIN' | 'STUDENT';
  onBack: () => void;
  onLogin?: () => void;
  onStartExam?: (exam: Exam, student: Student) => void;
  exams?: Exam[];
  students?: Student[];
}

const LoginPage: React.FC<Props> = ({ type, onBack, onLogin, onStartExam, exams, students }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (type === 'ADMIN') {
      if (user === 'Admin01' && pass === 'Admin@2025') {
        onLogin?.();
      } else {
        setError('Authentication Failed: Invalid Admin Credentials');
      }
    } else {
      const foundStudent = students?.find(s => s.rollNumber === user);
      
      if (!user) {
        setError('Please enter your Roll Number to continue');
        return;
      }

      if (!foundStudent) {
        setError('Roll Number not found. Please contact the administrator.');
        return;
      }

      if (exams && exams.length > 0) {
        onStartExam?.(exams[0], foundStudent);
      } else {
        setError('No active exams found in the system.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
        <div className={`p-4 text-white font-bold flex justify-between items-center ${type === 'ADMIN' ? 'bg-[#337ab7]' : 'bg-[#5cb85c]'}`}>
          <span className="tracking-tight">{type} ACCESS PORTAL</span>
          <button 
            type="button"
            onClick={onBack} 
            className="text-[10px] bg-black/20 hover:bg-black/40 px-3 py-1 rounded transition-colors uppercase font-black"
          >
            Back
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center mb-4">
            <img src="https://uniqueachievers.com/assets/img/logo-one.png" className="h-14 mx-auto mb-2" alt="Apex Logo" />
            <h2 className="text-[#0b3c66] font-black text-xl uppercase tracking-tighter">Apex Code Labs</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Institutional Examination System</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-black text-red-700 uppercase leading-tight">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
                {type === 'ADMIN' ? 'Administrator ID' : 'Student Roll Number'}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={user}
                  onChange={(e) => { setUser(e.target.value); setError(null); }}
                  className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-[#337ab7] outline-none transition-all pl-10 text-sm font-medium"
                  placeholder={type === 'ADMIN' ? "Enter Admin ID" : "e.g. 12345"}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              </div>
            </div>

            {type === 'ADMIN' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Secure Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    value={pass}
                    onChange={(e) => { setPass(e.target.value); setError(null); }}
                    className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-[#337ab7] outline-none transition-all pl-10 text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className={`w-full py-4 rounded-lg text-white font-black uppercase tracking-widest shadow-md hover:shadow-lg active:scale-[0.98] transition-all ${type === 'ADMIN' ? 'bg-[#337ab7] hover:bg-[#286090]' : 'bg-[#5cb85c] hover:bg-[#449d44]'}`}
          >
            {type === 'ADMIN' ? 'Validate Credentials' : 'Start Assessment'}
          </button>
          
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              SECURE SESSION • {new Date().toLocaleDateString()}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
