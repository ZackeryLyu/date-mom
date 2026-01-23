
import React from 'react';
import { CheckCheck } from 'lucide-react';

interface MomFeedbackProps {
  message: string;
  isLoading: boolean;
  darkMode?: boolean;
}

export const MomFeedback: React.FC<MomFeedbackProps> = ({ message, isLoading, darkMode = false }) => {
  return (
    <div className="w-full max-w-md mx-auto mt-2 px-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col items-end space-y-2">
         {/* Label */}
        <div className={`flex items-center space-x-2 text-xs mr-2 transition-colors duration-500 ${darkMode ? 'text-pink-200/70' : 'text-gray-400'}`}>
            <span>发送给 妈妈</span>
        </div>

        {/* Bubble */}
        <div className={`relative max-w-[90%] p-4 rounded-2xl rounded-tr-none shadow-sm text-white text-base leading-relaxed transition-colors duration-500 ${
            isLoading 
                ? 'bg-gray-400' 
                : darkMode 
                    ? 'bg-pink-600/90 backdrop-blur-sm shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                    : 'bg-green-500'
        }`}>
            {isLoading ? (
                <div className="flex space-x-1 items-center h-6">
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            ) : (
                <>
                    {message}
                    <div className="flex justify-end mt-1">
                        <CheckCheck className="w-4 h-4 text-white opacity-80" />
                    </div>
                </>
            )}
            {/* Tail */}
            <div className={`absolute top-0 right-0 -mr-2 w-0 h-0 border-t-[12px] border-l-[12px] border-l-transparent transform rotate-0 transition-colors duration-500 ${
                isLoading 
                    ? 'border-t-gray-400' 
                    : darkMode 
                        ? 'border-t-pink-600/90' 
                        : 'border-t-green-500'
            }`}></div>
        </div>
      </div>
    </div>
  );
};
