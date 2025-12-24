import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 text-white shadow-md z-20 flex-shrink-0">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.216 50.59 50.59 0 00-2.658.812m-15.482 0a50.57 50.57 0 00-1.756 4.35m15.481-4.35a50.58 50.58 0 001.756 4.35M12 20.904a48.627 48.627 0 01-3.298-2.929m3.298 2.929a48.627 48.627 0 013.298-2.929M12 6.13a4.35 4.35 0 014.35 4.35 4.35 4.35 0 01-4.35 4.35 4.35 4.35 0 01-4.35-4.35A4.35 4.35 0 0112 6.13z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Assam Down Town University</h1>
            <p className="text-xs text-blue-200 font-medium tracking-wide uppercase">AdtU Helpdesk</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
            Online
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;