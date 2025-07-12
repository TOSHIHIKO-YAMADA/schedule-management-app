'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Schedule {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'work' | 'vacation' | 'meeting' | 'maintenance' | 'appointment' | 'fieldwork';
  status: 'scheduled' | 'completed' | 'cancelled';
  siteName?: string;
  equipment?: string[];
  employee?: {
    name: string;
  };
  responsible?: {
    name: string;
  };
}

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onDateClick?: (date: Date) => void;
  onScheduleClick?: (schedule: Schedule) => void;
  onAddSchedule?: (date: Date) => void;
  isLoading?: boolean;
  viewMode?: 'month' | 'week' | 'day';
  onViewModeChange?: (mode: 'month' | 'week' | 'day') => void;
}

const scheduleTypeColors = {
  work: 'bg-blue-100 text-blue-800 border-blue-200',
  vacation: 'bg-green-100 text-green-800 border-green-200',
  meeting: 'bg-purple-100 text-purple-800 border-purple-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  appointment: 'bg-pink-100 text-pink-800 border-pink-200',
  fieldwork: 'bg-orange-100 text-orange-800 border-orange-200',
};

const scheduleTypeLabels = {
  work: '勤務',
  vacation: '休暇',
  meeting: '会議',
  maintenance: 'メンテナンス',
  appointment: '予約',
  fieldwork: '現場作業',
};

export function ScheduleCalendar({
  schedules,
  onDateClick,
  onScheduleClick,
  onAddSchedule,
  isLoading = false,
  viewMode = 'month',
  onViewModeChange,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 表示する日付範囲を計算
  const displayRange = useMemo(() => {
    switch (viewMode) {
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // 月曜日始まり
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      case 'day':
        return [currentDate];
      
      default:
        return [];
    }
  }, [currentDate, viewMode]);

  // 各日付のスケジュールを取得
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return isSameDay(scheduleDate, date);
    });
  };

  // 前/次へのナビゲーション
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        break;
      case 'day':
        setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        break;
      case 'day':
        setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
        break;
    }
  };

  const getCurrentTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'yyyy年 MM月', { locale: ja });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MM/dd', { locale: ja })} - ${format(weekEnd, 'MM/dd', { locale: ja })}`;
      case 'day':
        return format(currentDate, 'yyyy年 MM月 dd日', { locale: ja });
      default:
        return '';
    }
  };

  const renderScheduleItem = (schedule: Schedule, isCompact = false) => {
    const typeColor = scheduleTypeColors[schedule.type];
    const typeLabel = scheduleTypeLabels[schedule.type];
    
    return (
      <Tooltip key={schedule.id}>
        <TooltipTrigger asChild>
          <div
            className={`${typeColor} px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity mb-1 ${
              isCompact ? 'truncate' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onScheduleClick?.(schedule);
            }}
          >
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="font-medium truncate">
                {format(new Date(schedule.startTime), 'HH:mm')} {schedule.title}
              </span>
            </div>
            {schedule.siteName && !isCompact && (
              <div className="text-xs opacity-75 mt-1">
                📍 {schedule.siteName}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">{schedule.title}</div>
            <div className="text-sm">
              {format(new Date(schedule.startTime), 'HH:mm')} - {format(new Date(schedule.endTime), 'HH:mm')}
            </div>
            <div className="text-sm">
              <Badge variant="outline" className="text-xs">
                {typeLabel}
              </Badge>
            </div>
            {schedule.siteName && (
              <div className="text-sm">📍 {schedule.siteName}</div>
            )}
            {schedule.responsible && (
              <div className="text-sm">👤 {schedule.responsible.name}</div>
            )}
            {schedule.equipment && schedule.equipment.length > 0 && (
              <div className="text-sm">🔧 {schedule.equipment.join(', ')}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderMonthView = () => {
    const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* 曜日ヘッダー */}
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}
        
        {/* カレンダーの日付 */}
        {displayRange.map((date) => {
          const daySchedules = getSchedulesForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isDayToday = isToday(date);
          
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                !isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'
              } ${isDayToday ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => onDateClick?.(date)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDayToday ? 'text-blue-600' : ''}`}>
                  {format(date, 'd')}
                </span>
                {onAddSchedule && isCurrentMonth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSchedule(date);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-1">
                {daySchedules.slice(0, 3).map((schedule) => 
                  renderScheduleItem(schedule, true)
                )}
                {daySchedules.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{daySchedules.length - 3} 件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
    
    return (
      <div className="grid grid-cols-7 gap-4">
        {displayRange.map((date, index) => {
          const daySchedules = getSchedulesForDate(date);
          const isDayToday = isToday(date);
          
          return (
            <Card key={date.toISOString()} className={isDayToday ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>
                    {weekDays[index]} {format(date, 'd')}
                  </span>
                  {onAddSchedule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onAddSchedule(date)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {daySchedules.map((schedule) => 
                    renderScheduleItem(schedule)
                  )}
                  {daySchedules.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-4">
                      予定なし
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const daySchedules = getSchedulesForDate(currentDate);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{format(currentDate, 'yyyy年 MM月 dd日 (E)', { locale: ja })}</span>
            {onAddSchedule && (
              <Button
                onClick={() => onAddSchedule(currentDate)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                予定追加
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {daySchedules.length > 0 ? (
              daySchedules
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((schedule) => (
                  <Card key={schedule.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onScheduleClick?.(schedule)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={scheduleTypeColors[schedule.type]}>
                              {scheduleTypeLabels[schedule.type]}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {format(new Date(schedule.startTime), 'HH:mm')} - 
                              {format(new Date(schedule.endTime), 'HH:mm')}
                            </span>
                          </div>
                          <h3 className="font-medium mb-1">{schedule.title}</h3>
                          {schedule.siteName && (
                            <p className="text-sm text-gray-600">📍 {schedule.siteName}</p>
                          )}
                          {schedule.responsible && (
                            <p className="text-sm text-gray-600">👤 {schedule.responsible.name}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>この日の予定はありません</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {getCurrentTitle()}
            </h2>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            今日
          </Button>
        </div>

        {/* 表示モード切り替え */}
        {onViewModeChange && (
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('month')}
            >
              月
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
            >
              週
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('day')}
            >
              日
            </Button>
          </div>
        )}
      </div>

      {/* カレンダー表示 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      ) : (
        <div className="group">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>
      )}
    </div>
  );
}