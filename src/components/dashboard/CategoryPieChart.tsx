"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// カテゴリデータの型定義
interface CategoryData {
  name: string;
  value: number;
  color: string;
  icon: string;
}

// サンプルデータ（実際のデータと置き換える）
const categoryData: CategoryData[] = [
  { name: 'ミーティング', value: 35, color: '#3b82f6', icon: '🤝' },
  { name: '移動', value: 25, color: '#10b981', icon: '🚗' },
  { name: 'レビュー', value: 20, color: '#f59e0b', icon: '📋' },
  { name: '作業時間', value: 15, color: '#8b5cf6', icon: '💼' },
  { name: 'その他', value: 5, color: '#6b7280', icon: '📝' },
];

// カスタムツールチップ
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-border rounded-lg shadow-medium">
        <p className="font-semibold text-foreground flex items-center">
          <span className="mr-2">{data.icon}</span>
          {data.name}
        </p>
        <p className="text-primary">{`${data.value}%`}</p>
      </div>
    );
  }
  return null;
};

// カスタムラベル
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // 5%以下は表示しない
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// カスタム凡例
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center text-sm">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-muted-foreground flex items-center">
            <span className="mr-1">{entry.payload.icon}</span>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const CategoryPieChart: React.FC = () => {
  const totalTime = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-card-foreground mb-1">
            カテゴリ別時間配分
          </h3>
          <p className="text-sm text-muted-foreground">
            今週の活動カテゴリの割合
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {categoryData.length}
          </div>
          <div className="text-sm text-muted-foreground">カテゴリ</div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
            >
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* 統計情報 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-muted rounded-xl">
          <div className="text-lg font-semibold text-foreground">
            {categoryData[0].name}
          </div>
          <div className="text-sm text-muted-foreground">最も多いカテゴリ</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-xl">
          <div className="text-lg font-semibold text-foreground">
            {categoryData[0].value}%
          </div>
          <div className="text-sm text-muted-foreground">最大割合</div>
        </div>
      </div>
    </div>
  );
};