"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Bell, Plus, Car, Building2 } from "lucide-react";
import Link from "next/link";
import { todaySchedules, upcomingTasks, stats, recentActivities, employees, customers, vehicles, categorySettings, prioritySettings } from "@/lib/mockData";
import { Schedule, Task, ActivityLog } from "@/lib/types";
import { WeeklyScheduleChart } from "@/components/dashboard/WeeklyScheduleChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/animations/PageTransition";
import { InteractiveCard, InteractiveButton } from "@/components/animations/InteractiveCard";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' }));
  }, []);
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

  const getIconComponent = (iconName: string) => {
    const icons = {
      Calendar,
      Clock,
      CheckCircle,
      AlertCircle
    };
    return icons[iconName as keyof typeof icons] || Calendar;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="px-4 py-6 sm:px-0">
          <FadeIn delay={0.1}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold gradient-text">ダッシュボード</h1>
                <p className="text-muted-foreground mt-2">
                  {currentDate && `今日は${currentDate}です`}
                </p>
              </div>
              <div className="flex space-x-3">
                <InteractiveButton
                  variant="secondary"
                  className="border border-border shadow-soft"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  通知設定
                </InteractiveButton>
                <Link href="/schedules/new">
                  <InteractiveButton variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    新規作成
                  </InteractiveButton>
                </Link>
              </div>
            </div>
          </FadeIn>
        
          {/* モダンな統計カード */}
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = getIconComponent(stat.icon);
              return (
                <StaggerItem key={stat.label}>
                  <InteractiveCard 
                    className="bg-card rounded-3xl shadow-soft border border-border/50"
                    hoverScale={1.03}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className={`flex-shrink-0 ${stat.color} rounded-2xl p-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                          stat.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {stat.change}
                        </div>
                      </div>
                      <div className="mt-4">
                        <dt className="text-sm font-medium text-muted-foreground mb-1">
                          {stat.label}
                        </dt>
                        <dd className="text-3xl font-bold text-card-foreground">
                          {stat.value}
                        </dd>
                      </div>
                    </div>
                  </InteractiveCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* データ可視化セクション */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <InteractiveCard hoverScale={1.01}>
                <WeeklyScheduleChart />
              </InteractiveCard>
              <InteractiveCard hoverScale={1.01}>
                <CategoryPieChart />
              </InteractiveCard>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* 今日の予定 */}
              <div className="bg-card shadow-soft rounded-3xl border border-border/50">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">今日の予定</h2>
                <Link href="/schedules" className="text-sm text-primary hover:text-primary/80 font-medium">
                  すべて表示 →
                </Link>
              </div>
              <div className="flow-root">
                <ul className="-my-3 divide-y divide-gray-200">
                  {todaySchedules.map((schedule) => (
                    <li key={schedule.id} className="py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            schedule.category === 'meeting' ? 'bg-blue-100' :
                            schedule.category === 'review' ? 'bg-purple-100' :
                            schedule.category === 'report' ? 'bg-green-100' :
                            schedule.category === 'travel' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <Calendar className={`w-5 h-5 ${
                              schedule.category === 'meeting' ? 'text-blue-600' :
                              schedule.category === 'review' ? 'text-purple-600' :
                              schedule.category === 'report' ? 'text-green-600' :
                              schedule.category === 'travel' ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {schedule.title}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              categorySettings[schedule.category].color
                            }`}>
                              {categorySettings[schedule.category].label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{schedule.startTime} - {schedule.endTime}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {schedule.attendees.length}人
                            </div>
                            <div className="flex items-center">
                              <span>{schedule.location}</span>
                            </div>
                            {schedule.vehicleId && (
                              <div className="flex items-center">
                                <Car className="w-3 h-3 mr-1" />
                                {getVehicleName(schedule.vehicleId)}
                              </div>
                            )}
                            {schedule.customerId && (
                              <div className="flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                {getCustomerName(schedule.customerId)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
              </div>

              {/* 直近のタスク */}
              <div className="bg-card shadow-soft rounded-3xl border border-border/50">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-card-foreground">直近のタスク</h2>
                    <Link href="/tasks" className="text-sm text-primary hover:text-primary/80 font-medium">
                      すべて表示 →
                    </Link>
                  </div>
                  <div className="flow-root">
                    <ul className="-my-3 divide-y divide-border">
                  {upcomingTasks.map((task) => (
                    <li key={task.id} className="py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                            task.status === 'completed' ? 'bg-emerald-100' :
                            task.status === 'in_progress' ? 'bg-purple-100' :
                            'bg-muted'
                          }`}>
                            <CheckCircle className={`w-5 h-5 ${
                              task.status === 'completed' ? 'text-emerald-600' :
                              task.status === 'in_progress' ? 'text-purple-600' :
                              'text-muted-foreground'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-card-foreground truncate">
                              {task.title}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              task.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {task.status === 'completed' ? '完了' :
                               task.status === 'in_progress' ? '作業中' : '未着手'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">期限: {task.dueDate}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                prioritySettings[task.priority].color
                              }`}>
                                {prioritySettings[task.priority].label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                担当: {getEmployeeName(task.assignedTo)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-16 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{width: `${task.progress}%`}}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-muted-foreground">{task.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
              </div>

              {/* 最近の活動 */}
              <div className="bg-card shadow-soft rounded-3xl border border-border/50">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-card-foreground mb-6">最近の活動</h2>
                  <div className="flow-root">
                    <ul className="-my-3 divide-y divide-border">
                  {recentActivities.map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                            activity.action === 'create' ? 'bg-blue-100' :
                            activity.action === 'update' ? 'bg-amber-100' :
                            activity.action === 'complete' ? 'bg-emerald-100' :
                            'bg-red-100'
                          }`}>
                            <TrendingUp className={`w-5 h-5 ${
                              activity.action === 'create' ? 'text-blue-600' :
                              activity.action === 'update' ? 'text-amber-600' :
                              activity.action === 'complete' ? 'text-emerald-600' :
                              'text-red-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-card-foreground">
                              {activity.description}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.entityType === 'schedule' ? 'bg-blue-100 text-blue-800' :
                              activity.entityType === 'task' ? 'bg-purple-100 text-purple-800' :
                              activity.entityType === 'vehicle' ? 'bg-orange-100 text-orange-800' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {activity.entityType === 'schedule' ? 'スケジュール' :
                               activity.entityType === 'task' ? 'タスク' :
                               activity.entityType === 'vehicle' ? '車両' :
                               activity.entityType === 'customer' ? '顧客' : '従業員'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-card-foreground truncate">
                            {activity.entityName}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {getEmployeeName(activity.userId)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString('ja-JP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </PageTransition>
      </main>
      </div>
    </ProtectedRoute>
  );
}