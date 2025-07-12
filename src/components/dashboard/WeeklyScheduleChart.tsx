"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

// 週間データの型定義
interface WeeklyData {
  day: string;
  date: string;
  count: number;
  isToday: boolean;
}

// サンプルデータ（実際のデータと置き換える）
const generateWeeklyData = (today: Date): WeeklyData[] => {
  const weekStart = startOfWeek(today, { locale: ja, weekStartsOn: 0 }); // 日曜日開始
  
  const weekData: WeeklyData[] = [];
  // 固定のサンプルデータを使用（曜日に基づいた固定値）
  const sampleCounts = [5, 3, 7, 4, 6, 2, 4]; // 日曜日から土曜日
  
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStart, i);
    const dayName = format(currentDate, 'E', { locale: ja });
    const dateStr = format(currentDate, 'M/d');
    
    weekData.push({
      day: dayName,
      date: dateStr,
      count: sampleCounts[i],
      isToday: isSameDay(currentDate, today)
    });
  }
  
  return weekData;
};

// カスタムツールチップコンポーネント
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-border rounded-lg shadow-medium">
        <p className="font-semibold text-foreground">{`${data.day} (${data.date})`}</p>
        <p className="text-primary">
          <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
          {`${data.count}件の予定`}
        </p>
      </div>
    );
  }
  return null;
};

// カスタムラベルコンポーネント（現在は未使用）
// const CustomLabel = (props: any) => {
//   const { x, y, width, height, payload, index } = props;
//   
//   // payloadが存在しない場合は何も表示しない
//   if (!payload || payload.isToday === undefined) return null;
//   
//   const isToday = payload.isToday;
//   
//   if (!isToday) return null;
//   
//   return (
//     <text
//       x={x + width / 2}
//       y={y - 5}
//       fill="#ef4444"
//       textAnchor="middle"
//       fontSize="12"
//       fontWeight="bold"
//     >
//       今日
//     </text>
//   );
// };

export const WeeklyScheduleChart: React.FC = () => {
  // useMemoを使用して一貫したデータを生成
  const weeklyData = useMemo(() => {
    const today = new Date();
    return generateWeeklyData(today);
  }, []);

  return (
    <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-card-foreground mb-1">
            今週のスケジュール分布
          </h3>
          <p className="text-sm text-muted-foreground">
            各曜日の予定件数を表示しています
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {weeklyData.reduce((sum, day) => sum + day.count, 0)}
          </div>
          <div className="text-sm text-muted-foreground">総予定数</div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={(props: any) => {
                const { x, y, payload } = props;
                const data = weeklyData.find(d => d.day === payload.value);
                const isToday = data?.isToday || false;
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    {isToday && (
                      <text
                        x={0}
                        y={-20}
                        fill="#ef4444"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        今日
                      </text>
                    )}
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="middle"
                      fill={isToday ? '#3b82f6' : '#64748b'}
                      fontSize="12"
                      fontWeight={isToday ? 'bold' : 'normal'}
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={0}
                      dy={30}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                    >
                      {data?.date || ''}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[6, 6, 0, 0]}
            >
              {weeklyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? '#3b82f6' : '#e2e8f0'}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 凡例 */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary rounded mr-2"></div>
          <span className="text-muted-foreground">今日</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-muted rounded mr-2"></div>
          <span className="text-muted-foreground">その他の日</span>
        </div>
      </div>
    </div>
  );
};