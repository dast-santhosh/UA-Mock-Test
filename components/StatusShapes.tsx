
import React from 'react';

interface ShapeProps {
  label: string | number;
  className?: string;
}

export const NotVisitedShape: React.FC<ShapeProps> = ({ label, className = "" }) => (
  <div className={`w-8 h-8 flex items-center justify-center bg-[#f0f0f0] border border-gray-300 rounded text-xs font-bold text-gray-700 ${className}`}>
    {label}
  </div>
);

export const NotAnsweredShape: React.FC<ShapeProps> = ({ label, className = "" }) => (
  <div className={`w-8 h-8 flex items-center justify-center bg-[#ea5420] text-white text-xs font-bold nta-shape-not-answered ${className}`}>
    {label}
  </div>
);

export const AnsweredShape: React.FC<ShapeProps> = ({ label, className = "" }) => (
  <div className={`w-8 h-8 flex items-center justify-center bg-[#5cb85c] text-white text-xs font-bold nta-shape-answered ${className}`}>
    {label}
  </div>
);

export const MarkedForReviewShape: React.FC<ShapeProps> = ({ label, className = "" }) => (
  <div className={`w-8 h-8 flex items-center justify-center bg-[#5c5cb8] text-white text-xs font-bold rounded-full ${className}`}>
    {label}
  </div>
);

export const AnsweredMarkedShape: React.FC<ShapeProps> = ({ label, className = "" }) => (
  <div className={`relative w-8 h-8 flex items-center justify-center bg-[#5c5cb8] text-white text-xs font-bold rounded-full ${className}`}>
    {label}
    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
  </div>
);
