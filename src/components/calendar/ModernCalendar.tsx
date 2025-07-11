"use client";

import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventInput, EventClickArg, DateSelectArg, EventChangeArg } from '@fullcalendar/core';
import { schedules, categorySettings } from '@/lib/mockData';
import { Schedule } from '@/lib/types';

interface ModernCalendarProps {
  onEventClick?: (schedule: Schedule) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onEventChange?: (scheduleId: string, newStart: Date, newEnd: Date) => void;
}

// スケジュールデータをFullCalendarのイベント形式に変換
const convertSchedulesToEvents = (schedules: Schedule[]): EventInput[] => {
  return schedules.map(schedule => {
    const categoryColor = getCategoryColor(schedule.category);
    
    return {
      id: schedule.id,
      title: schedule.title,
      start: `${schedule.startDate}T${schedule.startTime}:00`,
      end: `${schedule.endDate}T${schedule.endTime}:00`,
      backgroundColor: categoryColor.bg,
      borderColor: categoryColor.border,
      textColor: categoryColor.text,
      className: `fc-event-${schedule.category}`,
      extendedProps: {
        description: schedule.description,
        location: schedule.location,
        category: schedule.category,
        priority: schedule.priority,
        attendees: schedule.attendees,
        customerId: schedule.customerId,
        vehicleId: schedule.vehicleId,
        originalSchedule: schedule
      }
    };
  });
};

// カテゴリごとの色設定
const getCategoryColor = (category: string) => {
  const colors = {
    meeting: {
      bg: '#3b82f6',
      border: '#2563eb',
      text: '#ffffff'
    },
    review: {
      bg: '#8b5cf6',
      border: '#7c3aed',
      text: '#ffffff'
    },
    report: {
      bg: '#10b981',
      border: '#059669',
      text: '#ffffff'
    },
    travel: {
      bg: '#f59e0b',
      border: '#d97706',
      text: '#ffffff'
    },
    maintenance: {
      bg: '#6b7280',
      border: '#4b5563',
      text: '#ffffff'
    }
  };
  
  return colors[category as keyof typeof colors] || colors.meeting;
};

export const ModernCalendar: React.FC<ModernCalendarProps> = ({
  onEventClick,
  onDateSelect,
  onEventChange
}) => {
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const calendarRef = useRef<FullCalendar>(null);
  
  const events = convertSchedulesToEvents(schedules);

  // イベントクリック処理
  const handleEventClick = (clickInfo: EventClickArg) => {
    const originalSchedule = clickInfo.event.extendedProps.originalSchedule as Schedule;
    if (onEventClick) {
      onEventClick(originalSchedule);
    }
  };

  // 日付選択処理
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  // イベント変更処理（ドラッグ＆ドロップ）
  const handleEventChange = (changeInfo: EventChangeArg) => {
    if (onEventChange && changeInfo.event.start && changeInfo.event.end) {
      onEventChange(
        changeInfo.event.id,
        changeInfo.event.start,
        changeInfo.event.end
      );
    }
  };

  // ビュー変更処理
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  // 今日に移動
  const goToToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  // 前の期間に移動
  const goToPrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
    }
  };

  // 次の期間に移動
  const goToNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
    }
  };

  return (
    <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-6">
      {/* カスタムヘッダー */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors duration-200"
          >
            今日
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrev}
              className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* ビュー切り替えボタン */}
        <div className="flex bg-secondary rounded-2xl p-1">
          <button
            onClick={() => handleViewChange('dayGridMonth')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              currentView === 'dayGridMonth'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            月
          </button>
          <button
            onClick={() => handleViewChange('timeGridWeek')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              currentView === 'timeGridWeek'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            週
          </button>
          <button
            onClick={() => handleViewChange('timeGridDay')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              currentView === 'timeGridDay'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            日
          </button>
          <button
            onClick={() => handleViewChange('listWeek')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              currentView === 'listWeek'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            リスト
          </button>
        </div>
      </div>

      {/* FullCalendar */}
      <div className="modern-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={false} // カスタムヘッダーを使用するため非表示
          height="auto"
          locale="ja"
          firstDay={0} // 日曜日始まり
          weekNumbers={false}
          
          // インタラクション設定
          selectable={true}
          selectMirror={true}
          editable={true}
          droppable={true}
          
          // イベントハンドラー
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventChange={handleEventChange}
          
          // 時間設定
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"
          
          // 表示設定
          dayMaxEvents={3}
          moreLinkText="他"
          eventDisplay="block"
          
          // カスタムスタイリング用のクラス
          dayHeaderClassNames="fc-day-header-modern"
          eventClassNames="fc-event-modern"
          
          // リストビューの設定
          listDayFormat={{ weekday: 'long', month: 'long', day: 'numeric' }}
          listDaySideFormat={false}
        />
      </div>
      
      {/* カテゴリ凡例 */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">カテゴリ</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(categorySettings).map(([key, setting]) => {
            const color = getCategoryColor(key);
            return (
              <div key={key} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.bg }}
                ></div>
                <span className="text-sm text-muted-foreground">{setting.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};