'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FieldworkScheduleFormData } from '@/lib/validations/schedule';

interface ScheduleTemplate {
  data: Partial<FieldworkScheduleFormData>;
  originalScheduleId: string;
  copiedAt: Date;
}

interface ScheduleTemplateContextType {
  template: ScheduleTemplate | null;
  copyScheduleTemplate: (scheduleData: Partial<FieldworkScheduleFormData>, originalId: string) => void;
  clearTemplate: () => void;
  hasTemplate: boolean;
}

const ScheduleTemplateContext = createContext<ScheduleTemplateContextType | undefined>(undefined);

export function ScheduleTemplateProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState<ScheduleTemplate | null>(null);

  const copyScheduleTemplate = (scheduleData: Partial<FieldworkScheduleFormData>, originalId: string) => {
    // 担当者情報をクリア（仕様に従い）
    const templateData = {
      ...scheduleData,
      // 日付をクリア（新しい日付で作成するため）
      date: '',
      // 担当者情報をリセット
      assignments: [],
      // 確定状態をリセット
      isConfirmed: false,
      // 繰り返し設定をリセット
      isRecurring: false,
      recurringDays: [],
      recurringEnd: '',
    };

    setTemplate({
      data: templateData,
      originalScheduleId: originalId,
      copiedAt: new Date(),
    });
  };

  const clearTemplate = () => {
    setTemplate(null);
  };

  const hasTemplate = template !== null;

  return (
    <ScheduleTemplateContext.Provider
      value={{
        template,
        copyScheduleTemplate,
        clearTemplate,
        hasTemplate,
      }}
    >
      {children}
    </ScheduleTemplateContext.Provider>
  );
}

export function useScheduleTemplate() {
  const context = useContext(ScheduleTemplateContext);
  if (context === undefined) {
    throw new Error('useScheduleTemplate must be used within a ScheduleTemplateProvider');
  }
  return context;
}