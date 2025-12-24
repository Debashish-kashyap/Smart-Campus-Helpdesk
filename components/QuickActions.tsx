import React from 'react';
import { QuickQuestion } from '../types';
import { QUICK_QUESTIONS } from '../constants';

interface QuickActionsProps {
  onQuestionSelect: (text: string) => void;
  disabled?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuestionSelect, disabled }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
      {QUICK_QUESTIONS.map((q) => (
        <button
          key={q.id}
          disabled={disabled}
          onClick={() => onQuestionSelect(q.text)}
          className="flex-shrink-0 snap-start bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {q.text}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;