import React from 'react';

export const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  </div>
);