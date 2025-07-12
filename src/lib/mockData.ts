/**
 * スケジュール管理アプリケーションのモックデータ
 */

import {
  Employee,
  Customer,
  Vehicle,
  Schedule,
  Task,
  ActivityLog,
  StatisticsData,
  VehicleUsage,
  NotificationSettings
} from './types';

// 従業員マスタデータ
export const employees: Employee[] = [
  {
    id: 'emp001',
    employeeNumber: 'E001',
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    email: 'tanaka@company.com',
    phone: '090-1234-5678',
    lineId: 'tanaka_taro',
    notificationMethod: 'both',
    nearestStation: '東京駅',
    transportation: 'train',
    role: 'super',
    department: '総務部',
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-07-01T10:30:00Z'
  },
  {
    id: 'emp002',
    employeeNumber: 'E002',
    name: '佐藤花子',
    nameKana: 'サトウハナコ',
    email: 'sato@company.com',
    phone: '090-2345-6789',
    lineId: 'sato_hanako',
    notificationMethod: 'email',
    nearestStation: '新宿駅',
    transportation: 'train',
    role: 'admin',
    department: '営業部',
    isActive: true,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-06-15T14:20:00Z'
  },
  {
    id: 'emp003',
    employeeNumber: 'E003',
    name: '山田次郎',
    nameKana: 'ヤマダジロウ',
    email: 'yamada@company.com',
    phone: '090-3456-7890',
    lineId: 'yamada_jiro',
    notificationMethod: 'line',
    nearestStation: '渋谷駅',
    transportation: 'car',
    role: 'limited_admin',
    department: '営業部',
    isActive: true,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-06-20T16:45:00Z'
  },
  {
    id: 'emp004',
    employeeNumber: 'E004',
    name: '鈴木三郎',
    nameKana: 'スズキサブロウ',
    email: 'suzuki@company.com',
    phone: '090-4567-8901',
    notificationMethod: 'email',
    nearestStation: '池袋駅',
    transportation: 'train',
    role: 'general',
    department: '技術部',
    isActive: true,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-07-05T11:15:00Z'
  },
  {
    id: 'emp005',
    employeeNumber: 'E005',
    name: '高橋美香',
    nameKana: 'タカハシミカ',
    email: 'takahashi@company.com',
    phone: '090-5678-9012',
    lineId: 'takahashi_mika',
    notificationMethod: 'both',
    nearestStation: '品川駅',
    transportation: 'bicycle',
    role: 'general',
    department: '経理部',
    isActive: true,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-06-30T13:30:00Z'
  }
];

// 顧客マスタデータ
export const customers: Customer[] = [
  {
    id: 'cust001',
    name: '株式会社山田商事',
    address: '東京都千代田区丸の内1-1-1',
    phone: '03-1234-5678',
    contactPerson: '山田花子',
    email: 'yamada@yamada-trading.com',
    website: 'https://yamada-trading.com',
    industry: '商社',
    isActive: true,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-06-25T15:20:00Z'
  },
  {
    id: 'cust002',
    name: '株式会社テックソリューションズ',
    address: '東京都港区赤坂2-2-2',
    phone: '03-2345-6789',
    contactPerson: '田中一郎',
    email: 'tanaka@tech-solutions.com',
    website: 'https://tech-solutions.com',
    industry: 'IT',
    isActive: true,
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-07-02T10:45:00Z'
  },
  {
    id: 'cust003',
    name: '株式会社グローバル物流',
    address: '神奈川県横浜市西区みなとみらい3-3-3',
    phone: '045-3456-7890',
    contactPerson: '鈴木二郎',
    email: 'suzuki@global-logistics.com',
    website: 'https://global-logistics.com',
    industry: '物流',
    isActive: true,
    createdAt: '2024-02-05T09:00:00Z',
    updatedAt: '2024-06-18T12:30:00Z'
  },
  {
    id: 'cust004',
    name: '株式会社製造業界',
    address: '大阪府大阪市中央区本町4-4-4',
    phone: '06-4567-8901',
    contactPerson: '佐藤三郎',
    email: 'sato@manufacturing.com',
    website: 'https://manufacturing.com',
    industry: '製造業',
    isActive: true,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-07-01T14:15:00Z'
  }
];

// 車両マスタデータ
export const vehicles: Vehicle[] = [
  {
    id: 'veh001',
    name: '営業車1号',
    licensePlate: '品川 500 あ 1234',
    inspectionDate: '2024-12-15',
    type: 'sedan',
    capacity: 5,
    fuelType: 'gasoline',
    isActive: true,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-06-10T11:00:00Z'
  },
  {
    id: 'veh002',
    name: '営業車2号',
    licensePlate: '品川 500 あ 5678',
    inspectionDate: '2025-03-20',
    type: 'sedan',
    capacity: 5,
    fuelType: 'hybrid',
    isActive: true,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-06-15T13:30:00Z'
  },
  {
    id: 'veh003',
    name: '配送用バン',
    licensePlate: '品川 500 か 9012',
    inspectionDate: '2024-09-30',
    type: 'van',
    capacity: 2,
    fuelType: 'diesel',
    isActive: true,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-06-20T09:45:00Z'
  },
  {
    id: 'veh004',
    name: '軽貨物車',
    licensePlate: '品川 500 さ 3456',
    inspectionDate: '2025-01-10',
    type: 'van',
    capacity: 2,
    fuelType: 'gasoline',
    isActive: true,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-06-25T15:20:00Z'
  },
  {
    id: 'veh005',
    name: '役員車',
    licensePlate: '品川 500 た 7890',
    inspectionDate: '2024-11-25',
    type: 'sedan',
    capacity: 5,
    fuelType: 'electric',
    isActive: true,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-06-30T10:15:00Z'
  }
];

// スケジュールデータ
export const schedules: Schedule[] = [
  {
    id: 'sch001',
    title: '顧客訪問 - 山田商事',
    description: '新規プロジェクトの提案と要件定義',
    startDate: '2024-07-09',
    endDate: '2024-07-09',
    startTime: '14:00',
    endTime: '16:00',
    category: 'meeting',
    priority: 'high',
    location: '東京都千代田区丸の内1-1-1',
    attendees: ['emp001', 'emp002'],
    customerId: 'cust001',
    vehicleId: 'veh001',
    isRecurring: false,
    createdBy: 'emp001',
    status: 'scheduled',
    reminder: {
      enabled: true,
      minutesBefore: 30
    },
    createdAt: '2024-07-05T09:00:00Z',
    updatedAt: '2024-07-05T09:00:00Z'
  },
  {
    id: 'sch002',
    title: 'チームミーティング',
    description: '週次進捗共有とタスク振り分け',
    startDate: '2024-07-09',
    endDate: '2024-07-09',
    startTime: '10:00',
    endTime: '11:00',
    category: 'meeting',
    priority: 'medium',
    location: '会議室A',
    attendees: ['emp001', 'emp002', 'emp003', 'emp004', 'emp005'],
    isRecurring: true,
    recurringPattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: [1], // 月曜日
      endDate: '2024-12-30'
    },
    createdBy: 'emp001',
    status: 'scheduled',
    reminder: {
      enabled: true,
      minutesBefore: 15
    },
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-01T09:00:00Z'
  },
  {
    id: 'sch003',
    title: 'システムレビュー',
    description: '第2四半期システム改修の成果発表',
    startDate: '2024-07-10',
    endDate: '2024-07-10',
    startTime: '15:00',
    endTime: '17:00',
    category: 'review',
    priority: 'high',
    location: '大会議室',
    attendees: ['emp001', 'emp004'],
    customerId: 'cust002',
    isRecurring: false,
    createdBy: 'emp004',
    status: 'scheduled',
    reminder: {
      enabled: true,
      minutesBefore: 60
    },
    createdAt: '2024-07-06T10:00:00Z',
    updatedAt: '2024-07-06T10:00:00Z'
  },
  {
    id: 'sch004',
    title: '配送業務',
    description: 'グローバル物流向け資材配送',
    startDate: '2024-07-11',
    endDate: '2024-07-11',
    startTime: '09:00',
    endTime: '15:00',
    category: 'travel',
    priority: 'medium',
    location: '神奈川県横浜市西区みなとみらい3-3-3',
    attendees: ['emp003'],
    customerId: 'cust003',
    vehicleId: 'veh003',
    isRecurring: false,
    createdBy: 'emp003',
    status: 'scheduled',
    reminder: {
      enabled: true,
      minutesBefore: 30
    },
    createdAt: '2024-07-07T11:00:00Z',
    updatedAt: '2024-07-07T11:00:00Z'
  },
  {
    id: 'sch005',
    title: '車両メンテナンス',
    description: '営業車1号の定期点検',
    startDate: '2024-07-12',
    endDate: '2024-07-12',
    startTime: '10:00',
    endTime: '12:00',
    category: 'maintenance',
    priority: 'low',
    location: '○○自動車整備工場',
    attendees: ['emp005'],
    vehicleId: 'veh001',
    isRecurring: true,
    recurringPattern: {
      type: 'monthly',
      interval: 3,
      endDate: '2024-12-31'
    },
    createdBy: 'emp005',
    status: 'scheduled',
    reminder: {
      enabled: true,
      minutesBefore: 60
    },
    createdAt: '2024-07-08T09:00:00Z',
    updatedAt: '2024-07-08T09:00:00Z'
  }
];

// タスクデータ
export const tasks: Task[] = [
  {
    id: 'task001',
    title: '山田商事提案資料作成',
    description: '新規プロジェクトの提案資料を作成',
    assignedTo: 'emp001',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-07-09',
    progress: 70,
    scheduleId: 'sch001',
    createdBy: 'emp001',
    createdAt: '2024-07-05T09:00:00Z',
    updatedAt: '2024-07-08T14:30:00Z'
  },
  {
    id: 'task002',
    title: '週次レポート作成',
    description: '営業部の週次活動報告書を作成',
    assignedTo: 'emp002',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-07-10',
    progress: 0,
    createdBy: 'emp001',
    createdAt: '2024-07-06T10:00:00Z',
    updatedAt: '2024-07-06T10:00:00Z'
  },
  {
    id: 'task003',
    title: 'システム改修テスト',
    description: '第2四半期システム改修のテスト実施',
    assignedTo: 'emp004',
    priority: 'high',
    status: 'completed',
    dueDate: '2024-07-09',
    progress: 100,
    scheduleId: 'sch003',
    createdBy: 'emp004',
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-08T17:00:00Z'
  }
];

// 活動履歴データ
export const activityLogs: ActivityLog[] = [
  {
    id: 'log001',
    userId: 'emp001',
    action: 'create',
    entityType: 'schedule',
    entityId: 'sch001',
    entityName: '顧客訪問 - 山田商事',
    description: '新しい予定を作成しました',
    timestamp: '2024-07-08T14:30:00Z'
  },
  {
    id: 'log002',
    userId: 'emp004',
    action: 'complete',
    entityType: 'task',
    entityId: 'task003',
    entityName: 'システム改修テスト',
    description: 'タスクを完了しました',
    timestamp: '2024-07-08T17:00:00Z'
  },
  {
    id: 'log003',
    userId: 'emp002',
    action: 'update',
    entityType: 'schedule',
    entityId: 'sch002',
    entityName: 'チームミーティング',
    description: '予定を編集しました',
    timestamp: '2024-07-07T16:45:00Z'
  }
];

// 統計データ
export const statisticsData: StatisticsData[] = [
  {
    label: '今日の予定',
    value: 3,
    change: '+2',
    color: 'bg-blue-500',
    icon: 'Calendar'
  },
  {
    label: '今週の予定',
    value: 12,
    change: '+5',
    color: 'bg-green-500',
    icon: 'Clock'
  },
  {
    label: '完了タスク',
    value: 28,
    change: '+12',
    color: 'bg-purple-500',
    icon: 'CheckCircle'
  },
  {
    label: '期限切れ',
    value: 2,
    change: '-1',
    color: 'bg-red-500',
    icon: 'AlertCircle'
  }
];

// 車両使用状況データ
export const vehicleUsages: VehicleUsage[] = [
  {
    vehicleId: 'veh001',
    scheduleId: 'sch001',
    startDateTime: '2024-07-09T13:30:00Z',
    endDateTime: '2024-07-09T16:30:00Z',
    employeeId: 'emp001',
    purpose: '顧客訪問',
    mileage: {
      start: 12450,
      end: 12478
    }
  },
  {
    vehicleId: 'veh003',
    scheduleId: 'sch004',
    startDateTime: '2024-07-11T08:30:00Z',
    endDateTime: '2024-07-11T15:30:00Z',
    employeeId: 'emp003',
    purpose: '配送業務',
    mileage: {
      start: 8920,
      end: 9015
    }
  }
];

// 通知設定データ
export const notificationSettings: NotificationSettings[] = [
  {
    userId: 'emp001',
    scheduleReminder: true,
    vehicleInspectionAlert: true,
    taskDeadlineAlert: true,
    emailNotifications: true,
    lineNotifications: true,
    reminderMinutes: 30
  },
  {
    userId: 'emp002',
    scheduleReminder: true,
    vehicleInspectionAlert: false,
    taskDeadlineAlert: true,
    emailNotifications: true,
    lineNotifications: false,
    reminderMinutes: 15
  }
];

// 今日の予定（ダッシュボード用）
export const todaySchedules = schedules.filter(schedule => 
  schedule.startDate === '2024-07-09'
);

// 直近のタスク（ダッシュボード用）
export const upcomingTasks = tasks.filter(task => 
  task.status !== 'completed' && task.status !== 'cancelled'
);

// 最近の活動（ダッシュボード用）
export const recentActivities = activityLogs.slice(0, 5);

// 統計データ（ダッシュボード用）
export const stats = statisticsData;

// カテゴリー別の表示設定
export const categorySettings = {
  meeting: {
    label: 'ミーティング',
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  review: {
    label: 'レビュー',
    color: 'bg-purple-100 text-purple-800',
    iconColor: 'text-purple-600'
  },
  report: {
    label: 'レポート',
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  },
  travel: {
    label: '出張・移動',
    color: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-600'
  },
  maintenance: {
    label: 'メンテナンス',
    color: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-600'
  }
};

// 優先度別の表示設定
export const prioritySettings = {
  high: {
    label: '高',
    color: 'bg-red-100 text-red-800'
  },
  medium: {
    label: '中',
    color: 'bg-yellow-100 text-yellow-800'
  },
  low: {
    label: '低',
    color: 'bg-green-100 text-green-800'
  }
};