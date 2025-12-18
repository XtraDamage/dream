import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>}
      <textarea
        className={`w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 rounded-lg p-4 focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-none transition-all placeholder-zinc-600 resize-none ${className}`}
        {...props}
      />
    </div>
  );
};