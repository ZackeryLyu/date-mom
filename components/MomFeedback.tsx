import React from 'react';
import { MessageCircleHeart, User } from 'lucide-react';

interface MomFeedbackProps {
  response: string;
  isLoading: boolean;
}

export const MomFeedback: React.FC<MomFeedbackProps> = ({ response, isLoading }) => {
  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
      <div className="bg-pink-500 p-4 flex items-center space-x-3">
        <div className="bg-white p-1 rounded-full">
            <User className="w-8 h-8 text-pink-500" />
        </div>
        <div>
            <h3 className="font-bold text-white text-lg">亲爱的妈妈</h3>
            <p className="text-pink-100 text-xs">刚刚在线</p>
        </div>
      </div>
      
      <div className="p-6 bg-slate-50 min-h-[120px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-gray-400 text-sm">妈妈正在输入...</p>
          </div>
        ) : (
          <div className="flex items-start space-x-3 w-full">
             <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-800 text-lg leading-relaxed relative w-full">
                {response || "点击打卡看看妈妈说什么..."}
                <div className="absolute top-0 left-0 -ml-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent transform rotate-0"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};