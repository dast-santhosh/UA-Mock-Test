
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col w-full shadow-md z-30 relative bg-white border-b-2 border-[#0b3c66]">
      {/* Top thin bar */}
      <div className="bg-[#0b3c66] h-7 flex items-center justify-between px-4">
        <div className="flex items-center text-white text-[10px] font-bold tracking-wide uppercase">
          <span className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-400 transition-colors">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
            Official Website
          </span>
        </div>
        <div className="text-white text-[9px] font-bold uppercase tracking-widest opacity-80">
          NTA / JEE Main 2024 Practice Mode
        </div>
      </div>
      
      {/* Main Branding Section */}
      <div className="flex items-center justify-between px-4 py-2 nta-header-main">
        <div className="flex items-center gap-3">
          {/* Logo at the left edge */}
          <img 
            src="https://uniqueachievers.com/assets/img/logo-one.png" 
            alt="Apex Code Labs Logo" 
            className="h-12 md:h-16 lg:h-20 object-contain nta-header-logo transition-all"
          />
          
          <div className="flex flex-col justify-center border-l-2 border-gray-100 pl-4">
             <div className="text-[#0b3c66] font-black text-xs md:text-sm lg:text-lg leading-none tracking-tight">JEE MAINS</div>
             <div className="text-gray-900 font-black text-lg md:text-2xl lg:text-3xl leading-none uppercase tracking-tighter">MOCK TEST PRACTICE</div>
             <div className="text-[#27ae60] text-[9px] md:text-[10px] lg:text-xs font-black italic tracking-widest uppercase mt-1">Apex Code Labs</div>
          </div>
        </div>

        {/* Right side styling - Apex Code Labs */}
        <div className="hidden sm:flex flex-col items-end leading-none pr-2 nta-header-right">
           <div className="text-[#27ae60] text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter leading-none">APEX</div>
           <div className="text-[#e67e22] text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter uppercase -mt-2">CODE LABS</div>
           <div className="text-gray-400 text-[7px] lg:text-[8px] font-bold mt-1 uppercase tracking-[0.3em]">Excellence Redefined</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
