import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstruction: string;
  onUpdateInstruction: (text: string) => void;
  notices: string[];
  onUpdateNotices: (notices: string[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentInstruction,
  onUpdateInstruction,
  notices,
  onUpdateNotices,
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [instructionText, setInstructionText] = useState(currentInstruction);
  const [newNotice, setNewNotice] = useState('');

  // Reset local state when opened
  useEffect(() => {
    if (isOpen) {
      setInstructionText(currentInstruction);
    }
  }, [isOpen, currentInstruction]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple PIN for demonstration
    if (password === '1234') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Incorrect PIN');
    }
  };

  const handleAddNotice = () => {
    if (newNotice.trim()) {
      onUpdateNotices([...notices, newNotice.trim()]);
      setNewNotice('');
    }
  };

  const handleRemoveNotice = (index: number) => {
    const updated = notices.filter((_, i) => i !== index);
    onUpdateNotices(updated);
  };

  const handleSaveInstruction = () => {
    onUpdateInstruction(instructionText);
    alert('AI Instructions Updated!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">Admin Control Panel</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto py-10">
              <div className="text-center mb-2">
                <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-blue-600">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900">Admin Access Required</h3>
                <p className="text-sm text-slate-500">Enter PIN "1234" to continue</p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PIN"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Unlock Panel
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              
              {/* Notices Section */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 p-1.5 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Campus Notices
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newNotice}
                      onChange={(e) => setNewNotice(e.target.value)}
                      placeholder="Enter a new notice..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddNotice}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      Add
                    </button>
                  </div>
                  
                  {notices.length === 0 ? (
                    <p className="text-slate-400 text-sm italic">No active notices.</p>
                  ) : (
                    <ul className="space-y-2">
                      {notices.map((notice, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                          <span className="text-slate-700">{notice}</span>
                          <button
                            onClick={() => handleRemoveNotice(idx)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Remove notice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* AI Instruction Section */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-600 p-1.5 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.25 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM2.5 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012.5 10zM4.93 5.99a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 11-1.06 1.06L4.93 5.99zM12.95 14.01a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06zM14.01 5.99a.75.75 0 01-1.06 1.06L11.89 5.99a.75.75 0 011.06-1.06l1.06 1.06zM5.99 14.01a.75.75 0 01-1.06 1.06L3.87 14.01a.75.75 0 011.06-1.06l1.06 1.06z" />
                    </svg>
                  </span>
                  AI Knowledge Base & Behavior
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  Edit the system instruction prompt to update how the AI behaves. Be careful!
                </p>
                <textarea
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  className="w-full h-64 p-4 text-sm font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  spellCheck={false}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSaveInstruction}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 font-medium text-sm shadow-sm transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;