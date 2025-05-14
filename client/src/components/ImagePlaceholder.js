import React from 'react';

const ImagePlaceholder = () => {
  return (
    <div className="relative w-full bg-gray-100 animate-pulse">
      {/* Maintain aspect ratio similar to Instagram posts (4:5) */}
      <div className="pb-[125%]"></div>
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer"></div>
    </div>
  );
};

export default ImagePlaceholder; 