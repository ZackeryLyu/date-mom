import React from 'react';
import { CheckInRecord } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Heart } from 'lucide-react';

interface HistoryListProps {
  history: CheckInRecord[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>还没有约会记录，妈妈要急死了！</p>
      </div>
    );
  }

  // Sort by date desc
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-3 mt-4">
      {sortedHistory.map((record) => (
        <div key={record.id} className="bg-white p-4 rounded-xl border-l-4 border-pink-400 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-gray-700 bg-pink-50 px-2 py-1 rounded-md">
              {format(record.timestamp, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </span>
            <Heart className="w-4 h-4 text-pink-500 fill-current" />
          </div>
          <div className="text-sm text-gray-600 italic border-l-2 border-gray-100 pl-3">
             "妈妈：{record.momResponse}"
          </div>
        </div>
      ))}
    </div>
  );
};