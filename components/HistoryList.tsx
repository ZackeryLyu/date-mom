
import React from 'react';
import { CheckInRecord } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Send } from 'lucide-react';

interface HistoryListProps {
  history: CheckInRecord[];
  darkMode?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, darkMode = false }) => {
  if (history.length === 0) {
    return (
      <div className={`text-center py-12 rounded-xl mx-4 border border-dashed transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-400'}`}>
        <p>还没有汇报记录</p>
        <p className="text-xs mt-2">快去打卡让妈妈放心吧！</p>
      </div>
    );
  }

  // Sort by date desc
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4 mt-2 px-2 pb-20">
      {sortedHistory.map((record) => (
        <div key={record.id} className={`p-4 rounded-xl shadow-sm border transition-colors ${darkMode ? 'bg-white/10 border-white/5 text-pink-50' : 'bg-white border-gray-100 text-gray-800'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${darkMode ? 'bg-white/10 text-pink-200/80' : 'bg-gray-50 text-gray-500'}`}>
              {format(record.timestamp, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </span>
            <div className={`flex items-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                <Send className="w-3 h-3 mr-1" />
                <span className="text-xs">已发送</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg text-sm leading-relaxed ${darkMode ? 'bg-black/20 text-white/90' : 'bg-green-50 text-gray-800'}`}>
             {record.reportMessage}
          </div>
        </div>
      ))}
    </div>
  );
};
