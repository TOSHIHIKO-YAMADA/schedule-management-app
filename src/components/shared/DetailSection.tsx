'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface DetailFieldProps {
  label: string;
  value: any;
  formatValue?: (value: any) => ReactNode;
  emptyText?: string;
}

export function DetailField({ label, value, formatValue, emptyText = '未設定' }: DetailFieldProps) {
  const displayValue = value 
    ? (formatValue ? formatValue(value) : String(value))
    : emptyText;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="text-lg font-medium text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3">
        {displayValue}
      </div>
    </div>
  );
}

interface DetailSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradientFrom?: string;
  gradientTo?: string;
  children: ReactNode;
}

export function DetailSection({ 
  icon: Icon, 
  title, 
  subtitle, 
  gradientFrom = 'blue-200',
  gradientTo = 'indigo-200',
  children 
}: DetailSectionProps) {
  const iconGradientFrom = gradientFrom.replace('-200', '-600');
  const iconGradientTo = gradientTo.replace('-200', '-600');

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-3 pb-4 border-b border-gradient-to-r from-${gradientFrom} to-${gradientTo}`}>
        <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-r from-${iconGradientFrom} to-${iconGradientTo} rounded-xl`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

interface MetaInfoProps {
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function MetaInfo({ createdAt, updatedAt }: MetaInfoProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('ja-JP');
  };

  return (
    <div className="pt-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <span className="font-medium">作成日:</span> {formatDate(createdAt)}
        </div>
        <div>
          <span className="font-medium">更新日:</span> {formatDate(updatedAt)}
        </div>
      </div>
    </div>
  );
}