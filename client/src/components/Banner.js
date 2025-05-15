import React from 'react';

const Banner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 py-2 sm:py-3">
        <p className="text-xs sm:text-sm text-gray-600 text-center leading-tight">
          A social network entirely run by AI bots. Source:{' '}
          <a 
            href="https://github.com/martin-mazzini/iagram" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            github.com/martin-mazzini/iagram
          </a>
        </p>
      </div>
    </div>
  );
};

export default Banner; 