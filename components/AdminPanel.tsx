import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { CampusDocument } from '../types';

// Set up worker for PDF.js
// Ensure GlobalWorkerOptions exists before setting (handles different import structures)
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstruction: string;
  onUpdateInstruction: (text: string) => void;
  notices: string[];
  onUpdateNotices: (notices: string[]) => void;
  documents: CampusDocument[];
  onUpdateDocuments: (docs: CampusDocument[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentInstruction,
  onUpdateInstruction,
  notices,
  onUpdateNotices,
  documents,
  onUpdateDocuments,
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [instructionText, setInstructionText] = useState(currentInstruction);
  const [newNotice, setNewNotice] = useState('');
  const [activeTab, setActiveTab] = useState<'notices' | 'documents' | 'ai'>('notices');
  const [isProcessingFile, setIsProcessingFile] = useState(false);


  useEffect(() => {
    if (isOpen) {
      setInstructionText(currentInstruction);
    }
  }, [isOpen, currentInstruction]);
 useEffect(() => {
  if (isOpen) {
    setInstructionText(currentInstruction);
  }
}, [isOpen, currentInstruction]);

useEffect(() => {
  fetch("https://smart-campus-helpdesk-1038185402530.us-west1.run.app/api/notices")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.notices)) {
        onUpdateNotices(data.notices);
      }
    });
}, []);

  const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    const res = await fetch(
      "https://smart-campus-helpdesk-1038185402530.us-west1.run.app/api/admin-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      }
    );

    return res.ok;
  } catch {
    return false;
  }
};

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const success = await verifyPin(password);

    if (success) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      alert("Incorrect PIN");
    }
  } catch {
    alert("Server error");
  }
};

if (!isOpen) return null;



  // --- Notices (BACKEND CONNECTED) ---

const handleAddNotice = async () => {
  if (!newNotice.trim()) return;

  const res = await fetch(
    "https://smart-campus-helpdesk-1038185402530.us-west1.run.app/api/notices",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notice: newNotice.trim() }),
    }
  );

  const data = await res.json();
  onUpdateNotices(data.notices);
  setNewNotice("");
};

const handleRemoveNotice = async (index: number) => {
  const res = await fetch(
    `https://smart-campus-helpdesk-1038185402530.us-west1.run.app/api/notices/${index}`,
    {
      method: "DELETE",
    }
  );

  const data = await res.json();
  onUpdateNotices(data.notices);
};


  // --- Documents ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);

    try {
      let content = '';
      const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text';

      if (fileType === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        
        // Use namespace import access
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `[Page ${i}]\n${pageText}\n\n`;
        }
        content = fullText;
      } else {
        // Assume text/markdown
        content = await file.text();
      }

      if (content.trim()) {
        const newDoc: CampusDocument = {
          id: Date.now().toString(),
          name: file.name,
          content: content,
          uploadDate: new Date().toLocaleDateString(),
          type: fileType as 'pdf' | 'text',
        };
        onUpdateDocuments([...documents, newDoc]);
        alert(`Successfully indexed: ${file.name}`);
      } else {
        alert('Could not extract text from the file. It might be empty or scanned (images).');
      }

    } catch (error) {
      console.error('File upload error:', error);
      alert('Error processing file. Please check if it is a valid PDF or text file.');
    } finally {
      setIsProcessingFile(false);
      // Clear input
      event.target.value = '';
    }
  };

  const handleRemoveDocument = (id: string) => {
    if (window.confirm('Are you sure you want to remove this document from the AI knowledge base?')) {
      const updated = documents.filter(d => d.id !== id);
      onUpdateDocuments(updated);
    }
  };

  // --- AI Config ---
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
                <p className="text-sm text-slate-500">Enter Admin PIN to continue</p>
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
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('notices')}
                  className={`flex-1 min-w-max px-4 pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'notices' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Notice Banner
                  {activeTab === 'notices' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 min-w-max px-4 pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'documents' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Knowledge Base (PDFs)
                  {activeTab === 'documents' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 min-w-max px-4 pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'ai' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  AI Base Config
                  {activeTab === 'ai' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1">
                {activeTab === 'notices' && (
                  <section className="animate-fadeIn">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Top Banner Notices</h3>
                      <p className="text-xs text-slate-500 mb-3">These short notices appear at the top of the chat.</p>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newNotice}
                          onChange={(e) => setNewNotice(e.target.value)}
                          placeholder="Enter a short notice..."
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNotice()}
                        />
                        <button
                          onClick={handleAddNotice}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                        >
                          Add
                        </button>
                      </div>
                      
                      {notices.length === 0 ? (
                        <p className="text-slate-400 text-sm italic text-center py-4">No active banner notices.</p>
                      ) : (
                        <ul className="space-y-2">
                          {notices.map((notice, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm group">
                              <span className="text-slate-700">{notice}</span>
                              <button onClick={() => handleRemoveNotice(idx)} className="text-slate-400 hover:text-red-500 transition-colors ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                )}

                {activeTab === 'documents' && (
                  <section className="animate-fadeIn">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                      <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wider">Upload Circulars & PDFs</h3>
                      <p className="text-xs text-slate-500 mb-3">Upload official documents (PDF or Text). The AI will read and index them to answer student queries.</p>
                      
                      <div className="relative">
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isProcessingFile ? 'bg-slate-100 border-slate-300' : 'bg-white border-blue-200 hover:bg-blue-50'}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isProcessingFile ? (
                              <div className="flex flex-col items-center">
                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-sm text-slate-500">Extracting text...</p>
                              </div>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-500 mb-2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <p className="text-sm text-slate-700 font-medium">Click to upload PDF or Text file</p>
                                <p className="text-xs text-slate-400 mt-1">Supports .pdf, .txt, .md</p>
                              </>
                            )}
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.txt,.md" 
                            onChange={handleFileUpload}
                            disabled={isProcessingFile}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase">Indexed Documents ({documents.length})</h4>
                      {documents.length === 0 ? (
                        <p className="text-slate-400 text-sm italic">No documents indexed yet.</p>
                      ) : (
                        documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`p-2 rounded-lg ${doc.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                {doc.type === 'pdf' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M5.625 1.5H9a.375.375 0 01.375.375v1.875c0 1.036.84 1.875 1.875 1.875h2.95a2.25 2.25 0 012.25 2.25v11.625c0 1.035-.84 1.875-1.875 1.875H5.625A1.875 1.875 0 013.75 19.5V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V12z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013 16.125V4.875zM8.25 6a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 018.25 6zM7.5 9.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zm0 3.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zM20.25 3a.75.75 0 01.75.75v11.25c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0112.75 15V4.875c0-1.036.84-1.875 1.875-1.875h4.5A.75.75 0 0120.25 3z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-700 truncate">{doc.name}</span>
                                <span className="text-[10px] text-slate-400">{doc.uploadDate} • {doc.content.length.toLocaleString()} chars</span>
                              </div>
                            </div>
                            <button onClick={() => handleRemoveDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149-.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}

                {activeTab === 'ai' && (
                  <section className="animate-fadeIn">
                     <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wider">Base System Instruction</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      This is the core personality of the AI. Documents and notices are appended to this automatically.
                    </p>
                    <textarea
                      value={instructionText}
                      onChange={(e) => setInstructionText(e.target.value)}
                      className="w-full h-80 p-4 text-sm font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      spellCheck={false}
                    />
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSaveInstruction}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 font-medium text-sm shadow-sm transition-all active:scale-95"
                      >
                        Save Changes
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;