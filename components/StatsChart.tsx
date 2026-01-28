import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckInRecord } from '../types';
import { format, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface StatsChartProps {
  history: CheckInRecord[];
  darkMode?: boolean;
}

export const StatsChart: React.FC<StatsChartProps> = ({ history, darkMode = false }) => {
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

  // Both modes now use Pink (one matches the dark aesthetic, one matches the light aesthetic)
  const barActiveColor = '#ec4899'; 
  const barInactiveColor = darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6';
  const axisColor = darkMode ? 'rgba(255,255,255,0.5)' : '#9ca3af';

  return (
    <div className={`w-full h-full p-2 rounded-xl shadow-sm border transition-colors duration-500 ${darkMode ? 'bg-transparent border-transparent' : 'bg-white border-pink-50'}`}>
      <h3 className={`text-xs font-semibold mb-1 transition-colors ${darkMode ? 'text-pink-200/80' : 'text-gray-500'}`}>最近7天</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: axisColor }} 
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : '#fce7f3' }}
            contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: darkMode ? '#1f2937' : '#fff',
                color: darkMode ? '#fff' : '#333',
                fontSize: '12px',
                padding: '8px'
            }}
            formatter={(value: number) => [value === 1 ? '已约' : '未约', '状态']}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value === 1 ? barActiveColor : barInactiveColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};