/**
 * スケジュール管理アプリケーションの型定義
 */

// 権限レベル
export type UserRole = 'super' | 'admin' | 'limited_admin' | 'general';

// 通知方法
export type NotificationMethod = 'email' | 'line' | 'both';

// 交通手段
export type Transportation = 'train' | 'car' | 'bicycle' | 'walk';

// 車両タイプ
export type VehicleType = 'sedan' | 'van' | 'truck';

// スケジュールカテゴリ
export type ScheduleCategory = 'meeting' | 'review' | 'report' | 'travel' | 'maintenance';

// 優先度
export type Priority = 'high' | 'medium' | 'low';

// スケジュールステータス
export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// 繰り返しパターンタイプ
export type RecurringType = 'daily' | 'weekly' | 'monthly';

// 従業員データ
export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  lineId?: string;
  notificationMethod: NotificationMethod;
  nearestStation: string;
  transportation: Transportation;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 顧客データ
export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  contactPerson: string;
  email: string;
  website?: string;
  industry?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 車両データ
export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  inspectionDate: string;
  type: VehicleType;
  capacity: number;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 繰り返しパターン
export interface RecurringPattern {
  type: RecurringType;
  interval: number;
  daysOfWeek?: number[]; // 0=日曜日, 1=月曜日, ...
  endDate?: string;
  maxOccurrences?: number;
}

// スケジュール
export interface Schedule {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: ScheduleCategory;
  priority: Priority;
  location: string;
  attendees: string[]; // Employee IDs
  customerId?: string;
  vehicleId?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdBy: string;
  status: ScheduleStatus;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  createdAt: string;
  updatedAt: string;
}

// タスク
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Employee ID
  priority: Priority;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  progress: number; // 0-100
  scheduleId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 活動履歴
export interface ActivityLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'complete';
  entityType: 'schedule' | 'task' | 'vehicle' | 'customer' | 'employee';
  entityId: string;
  entityName: string;
  description: string;
  timestamp: string;
}

// 統計データ
export interface StatisticsData {
  label: string;
  value: number;
  change: string;
  color: string;
  icon: string;
}

// 車両使用状況
export interface VehicleUsage {
  vehicleId: string;
  scheduleId: string;
  startDateTime: string;
  endDateTime: string;
  employeeId: string;
  purpose: string;
  mileage?: {
    start: number;
    end: number;
  };
}

// 通知設定
export interface NotificationSettings {
  userId: string;
  scheduleReminder: boolean;
  vehicleInspectionAlert: boolean;
  taskDeadlineAlert: boolean;
  emailNotifications: boolean;
  lineNotifications: boolean;
  reminderMinutes: number;
}

// APIレスポンス用の共通型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ページネーション
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 検索・フィルタリング
export interface ScheduleFilter {
  startDate?: string;
  endDate?: string;
  category?: ScheduleCategory;
  priority?: Priority;
  status?: ScheduleStatus;
  employeeId?: string;
  customerId?: string;
  vehicleId?: string;
}