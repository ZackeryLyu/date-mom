import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckInRecord } from '../types';
import { format, subDays, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface StatsChartProps {
  history: CheckInRecord[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ history }) => {
  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      return d;
    });

    return last7Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const hasCheckIn = history.some(h => h.dateStr === dayStr);
      return {
        name: format(day, 'EEE', { locale: zhCN }), // 周一, 周二...
        fullDate: dayStr,
        value: hasCheckIn ? 1 : 0,
      };
    });
  }, [history]);

  return (
    <div className="w-full h-48 mt-4 bg-white p-4 rounded-xl shadow-sm border border-pink-50">
      <h3 className="text-sm font-semibold text-gray-500 mb-2">最近7天约会记录</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#888' }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#fdf2f8' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [value === 1 ? '已约' : '未约', '状态']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value === 1 ? '#ec4899' : '#e5e7eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};