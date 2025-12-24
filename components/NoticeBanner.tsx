import React from 'react';

interface NoticeBannerProps {
  notices: string[];
}

const NoticeBanner: React.FC<NoticeBannerProps> = ({ notices }) => {
  if (notices.length === 0) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          {notices.map((notice, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{notice}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeBanner;