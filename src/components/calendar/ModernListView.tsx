"use client";

import React from 'react';
import { Calendar, Clock, Users, MapPin, Car, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Schedule } from '@/lib/types';
import { employees, customers, vehicles, categorySettings, prioritySettings } from '@/lib/mockData';

interface ModernListViewProps {
  schedules: Schedule[];
  onScheduleClick?: (schedule: Schedule) => void;
}

// アバター生成関数
const generateAvatar = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
    'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500'
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return {
    color: colors[colorIndex],
    initial: name.charAt(0)
  };
};

export const ModernListView: React.FC<ModernListViewProps> = ({
  schedules,
  onScheduleClick
}) => {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : '不明';
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return null;
    const customer = customers.find(cust => cust.id === customerId);
    return customer ? customer.name : '不明';
  };

  const getVehicleName = (vehicleId?: string) => {
    if (!vehicleId) return null;
    const vehicle = vehicles.find(veh => veh.id === vehicleId);
    return vehicle ? vehicle.name : '不明';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      meeting: '🤝',
      review: '📋',
      report: '📊',
      travel: '🚗',
      maintenance: '🔧'
    };
    return icons[category as keyof typeof icons] || '📅';
  };

  // 日付でグループ化
  const groupedSchedules = schedules.reduce((groups, schedule) => {
    const date = schedule.startDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {} as Record<string, Schedule[]>);

  // 日付をソート
  const sortedDates = Object.keys(groupedSchedules).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明日';
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    }
  };

  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <div key={date} className="bg-card rounded-3xl shadow-soft border border-border/50 overflow-hidden">
          {/* 日付ヘッダー */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {formatDate(date)}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {groupedSchedules[date].length}件の予定
              </div>
            </div>
          </div>

          {/* スケジュールリスト */}
          <div className="divide-y divide-border/50">
            {groupedSchedules[date].map((schedule, index) => (
              <div
                key={schedule.id}
                className="group p-6 hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
                onClick={() => onScheduleClick?.(schedule)}
              >
                <div className="flex items-start space-x-4">
                  {/* カテゴリアイコン */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg ${
                    schedule.category === 'meeting' ? 'bg-blue-500' :
                    schedule.category === 'review' ? 'bg-purple-500' :
                    schedule.category === 'report' ? 'bg-green-500' :
                    schedule.category === 'travel' ? 'bg-orange-500' :
                    'bg-gray-500'
                  } group-hover:scale-110 transition-transform duration-200`}>
                    {getCategoryIcon(schedule.category)}
                  </div>

                  {/* メイン情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {schedule.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {schedule.description}
                        </p>
                      </div>
                      
                      {/* 右側の情報 */}
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          prioritySettings[schedule.priority].color
                        }`}>
                          {prioritySettings[schedule.priority].label}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          categorySettings[schedule.category].color
                        }`}>
                          {categorySettings[schedule.category].label}
                        </span>
                      </div>
                    </div>

                    {/* 詳細情報 */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 時間 */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">{schedule.startTime} - {schedule.endTime}</span>
                      </div>

                      {/* 場所 */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span className="truncate">{schedule.location}</span>
                      </div>

                      {/* 参加者数 */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{schedule.attendees.length}人</span>
                      </div>

                      {/* 車両情報 */}
                      {schedule.vehicleId && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Car className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="truncate">{getVehicleName(schedule.vehicleId)}</span>
                        </div>
                      )}
                    </div>

                    {/* 参加者アバター */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-muted-foreground">参加者:</span>
                        <div className="flex -space-x-2">
                          {schedule.attendees.slice(0, 4).map((attendeeId) => {
                            const employeeName = getEmployeeName(attendeeId);
                            const avatar = generateAvatar(employeeName);
                            return (
                              <div
                                key={attendeeId}
                                className={`relative w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs font-semibold border-2 border-white`}
                                title={employeeName}
                              >
                                {avatar.initial}
                              </div>
                            );
                          })}
                          {schedule.attendees.length > 4 && (
                            <div className="relative w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                              +{schedule.attendees.length - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 顧客情報 */}
                      {schedule.customerId && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4 mr-2 text-cyan-500" />
                          <span className="truncate">{getCustomerName(schedule.customerId)}</span>
                        </div>
                      )}

                      {/* 詳細リンク */}
                      <Link
                        href={`/schedules/${schedule.id}`}
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium group-hover:translate-x-1 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        詳細
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {schedules.length === 0 && (
        <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            スケジュールがありません
          </h3>
          <p className="text-muted-foreground mb-6">
            検索条件を変更するか、新しいスケジュールを作成してください。
          </p>
          <Link
            href="/schedules/new"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl shadow-colored hover:shadow-large transition-all duration-300 hover:scale-105"
          >
            新規スケジュール作成
          </Link>
        </div>
      )}
    </div>
  );
};