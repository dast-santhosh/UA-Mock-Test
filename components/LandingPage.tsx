
import React from 'react';
import { AppView } from '../types';

interface Props {
  onNavigate: (view: AppView) => void;
}

const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#f1f4f7] flex flex-col items-center">
      <div className="w-full bg-[#0b3c66] h-2 mb-10"></div>
      <div className="max-w-4xl w-full px-6 flex flex-col items-center">
        <img src="https://uniqueachievers.com/assets/img/logo-one.png" alt="Apex Logo" className="h-24 mb-6" />
        <h1 className="text-3xl font-black text-[#0b3c66] mb-2 uppercase">Apex Code Labs</h1>
        <p className="text-gray-500 font-bold mb-12 tracking-widest uppercase text-sm">National Examination Portal V 2.0</p>
        
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl">
          <button 
            onClick={() => onNavigate('STUDENT_LOGIN')}
            className="group bg-white p-8 rounded-xl border-b-4 border-gray-200 hover:border-[#337ab7] transition-all shadow-lg text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg className="w-8 h-8 text-[#337ab7]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"></path></svg>
            </div>
            <h2 className="text-xl font-black text-[#0b3c66] mb-2">STUDENT PORTAL</h2>
            <p className="text-xs text-gray-500 font-bold uppercase">Candidate Login & Practice</p>
          </button>

          <button 
            onClick={() => onNavigate('ADMIN_LOGIN')}
            className="group bg-white p-8 rounded-xl border-b-4 border-gray-200 hover:border-[#e67e22] transition-all shadow-lg text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <svg className="w-8 h-8 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
            <h2 className="text-xl font-black text-[#0b3c66] mb-2">ADMIN PORTAL</h2>
            <p className="text-xs text-gray-500 font-bold uppercase">Staff & Management Access</p>
          </button>
        </div>
      </div>
      <footer className="mt-auto py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Powered by Apex Code Labs • Wisdom is Immortal
      </footer>
    </div>
  );
};

export default LandingPage;
