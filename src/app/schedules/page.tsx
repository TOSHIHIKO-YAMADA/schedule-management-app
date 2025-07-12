'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Calendar as CalendarIcon, List, Filter, MoreHorizontal } from 'lucide-react';
import { ScheduleCalendar } from '@/components/schedules/ScheduleCalendar';
import { FieldworkScheduleForm } from '@/components/schedules/FieldworkScheduleForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert';
import type { FieldworkScheduleFormData } from '@/lib/validations/schedule';

type ViewMode = 'month' | 'week' | 'day' | 'list';

interface ScheduleWithDetails {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'work' | 'vacation' | 'meeting' | 'maintenance' | 'appointment' | 'fieldwork';
  status: 'scheduled' | 'completed' | 'cancelled';
  siteName?: string;
  equipment?: string[];
  employee?: {
    id: string;
    name: string;
    department: string;
  };
  responsible?: {
    id: string;
    name: string;
    department: string;
  };
  customer?: {
    id: string;
    name: string;
    contactPerson: string;
  };
  vehicle?: {
    id: string;
    name: string;
    licensePlate: string;
  };
  timeSlots?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    requiredPersons: number;
  }>;
  assignments?: Array<{
    id: string;
    role: string;
    isManager: boolean;
    employee: {
      id: string;
      name: string;
      department: string;
      position: string;
    };
  }>;
}

export default function SchedulesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // APIからスケジュールデータを取得
  const { data: schedules = [], isLoading, error, refetch } = useQuery({
    queryKey: ['schedules', searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const response = await apiClient.get(`/schedules?${params.toString()}`);
      return response.data.data as ScheduleWithDetails[];
    },
  });

  // カレンダー用にデータを変換
  const calendarSchedules = schedules.map(schedule => ({
    ...schedule,
    startTime: new Date(schedule.startTime),
    endTime: new Date(schedule.endTime),
  }));

  const handleScheduleClick = (schedule: any) => {
    router.push(`/schedules/${schedule.id}`);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowAddForm(true);
  };

  const handleAddSchedule = async (data: FieldworkScheduleFormData) => {
    try {
      // フォームデータをAPI形式に変換
      const scheduleData = {
        title: data.siteName,
        type: 'fieldwork' as const,
        siteName: data.siteName,
        address: data.address,
        responsibleId: data.responsibleId,
        equipment: data.equipment,
        timeSlots: data.timeSlots.map(slot => ({
          startTime: new Date(`${data.date}T${slot.startTime}`).toISOString(),
          endTime: new Date(`${data.date}T${slot.endTime}`).toISOString(),
          requiredPersons: slot.requiredPersons,
        })),
        assignments: data.assignments,
        meetingPoint: data.meetingPoint,
        meetingCategory: data.meetingCategory,
        isRecurring: data.isRecurring,
        recurringPattern: data.recurringPattern,
        recurringEnd: data.recurringEnd ? new Date(data.recurringEnd).toISOString() : undefined,
        canDuplicate: data.canDuplicate,
        description: data.notes,
        // 最初の時間帯を基準にスケジュール全体の時間を設定
        startTime: new Date(`${data.date}T${data.timeSlots[0]?.startTime || '09:00'}`).toISOString(),
        endTime: new Date(`${data.date}T${data.timeSlots[data.timeSlots.length - 1]?.endTime || '17:00'}`).toISOString(),
        employeeId: 'current-user-id', // 実際の実装では現在のユーザーIDを使用
      };

      await apiClient.post('/schedules', scheduleData);
      setShowAddForm(false);
      setSelectedDate(null);
      refetch();
    } catch (error) {
      console.error('スケジュール作成エラー:', error);
    }
  };

  const scheduleTypeCounts = schedules.reduce((acc, schedule) => {
    acc[schedule.type] = (acc[schedule.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderListView = () => {
    if (schedules.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">スケジュールがありません</p>
            <Button onClick={() => setShowAddForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              最初のスケジュールを追加
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleScheduleClick(schedule)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getScheduleTypeColor(schedule.type)}>
                      {getScheduleTypeLabel(schedule.type)}
                    </Badge>
                    <Badge variant={schedule.status === 'completed' ? 'success' : 'secondary'}>
                      {getStatusLabel(schedule.status)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {new Date(schedule.startTime).toLocaleDateString('ja-JP')} {' '}
                      {new Date(schedule.startTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(schedule.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{schedule.title}</h3>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {schedule.siteName && (
                      <p>📍 {schedule.siteName}</p>
                    )}
                    {schedule.responsible && (
                      <p>👤 責任者: {schedule.responsible.name} ({schedule.responsible.department})</p>
                    )}
                    {schedule.customer && (
                      <p>🏢 顧客: {schedule.customer.name}</p>
                    )}
                    {schedule.vehicle && (
                      <p>🚗 車両: {schedule.vehicle.name} ({schedule.vehicle.licensePlate})</p>
                    )}
                    {schedule.assignments && schedule.assignments.length > 0 && (
                      <p>👥 担当者: {schedule.assignments.map(a => a.employee.name).join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ApiErrorAlert error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-indigo-100">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* ヘッダーセクション */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5 rounded-2xl blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-white via-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                      スケジュール管理
                    </h1>
                    <p className="text-gray-600 text-lg">
                      チーム全体のスケジュールを効率的に管理・確認
                    </p>
                  </div>
                </div>
                
                {/* 統計情報 */}
                <div className="flex gap-4 mt-4">
                  <div className="text-sm">
                    <span className="text-gray-600">総予定数: </span>
                    <span className="font-semibold text-gray-900">{schedules.length}件</span>
                  </div>
                  {scheduleTypeCounts.fieldwork > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">現場作業: </span>
                      <span className="font-semibold text-orange-600">{scheduleTypeCounts.fieldwork}件</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新規登録
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/80 px-4 py-3 rounded-xl shadow-sm"
                    >
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      その他
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>データ操作</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      iCalエクスポート
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <List className="mr-2 h-4 w-4" />
                      CSVエクスポート
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター・検索セクション */}
        <div className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="スケジュール名、現場名、担当者で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg text-base shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44 h-12 border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="タイプ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="fieldwork">現場作業</SelectItem>
                  <SelectItem value="meeting">会議</SelectItem>
                  <SelectItem value="work">勤務</SelectItem>
                  <SelectItem value="vacation">休暇</SelectItem>
                  <SelectItem value="maintenance">メンテナンス</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-12 border-gray-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="scheduled">予定</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              
              {/* 表示モード切り替え */}
              <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="h-10"
                >
                  月
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="h-10"
                >
                  週
                </Button>
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className="h-10"
                >
                  日
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-10"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {viewMode === 'list' ? (
            <div className="p-6">
              {renderListView()}
            </div>
          ) : (
            <div className="p-6">
              <ScheduleCalendar
                schedules={calendarSchedules}
                onDateClick={handleDateClick}
                onScheduleClick={handleScheduleClick}
                onAddSchedule={setShowAddForm ? (date: Date) => {
                  setSelectedDate(date);
                  setShowAddForm(true);
                } : undefined}
                isLoading={isLoading}
                viewMode={viewMode === 'list' ? 'month' : viewMode}
                onViewModeChange={(mode) => setViewMode(mode)}
              />
            </div>
          )}
        </div>

        {/* 現場予定追加フォーム */}
        {showAddForm && (
          <FieldworkScheduleForm
            onSubmit={handleAddSchedule}
            onCancel={() => {
              setShowAddForm(false);
              setSelectedDate(null);
            }}
            initialData={selectedDate ? {
              date: selectedDate.toISOString().split('T')[0],
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}

// ヘルパー関数
function getScheduleTypeColor(type: string) {
  const colors = {
    work: 'bg-blue-100 text-blue-800',
    vacation: 'bg-green-100 text-green-800',
    meeting: 'bg-purple-100 text-purple-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    appointment: 'bg-pink-100 text-pink-800',
    fieldwork: 'bg-orange-100 text-orange-800',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

function getScheduleTypeLabel(type: string) {
  const labels = {
    work: '勤務',
    vacation: '休暇',
    meeting: '会議',
    maintenance: 'メンテナンス',
    appointment: '予約',
    fieldwork: '現場作業',
  };
  return labels[type as keyof typeof labels] || type;
}

function getStatusLabel(status: string) {
  const labels = {
    scheduled: '予定',
    completed: '完了',
    cancelled: 'キャンセル',
  };
  return labels[status as keyof typeof labels] || status;
}