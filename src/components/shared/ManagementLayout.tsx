'use client';

import { ReactNode } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Search, MoreHorizontal, Upload, Download, FileText, TestTube, Trash2 } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface ManagementLayoutProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: {
    filter1?: {
      value: string;
      onChange: (value: string) => void;
      placeholder: string;
      options: FilterOption[];
    };
    filter2?: {
      value: string;
      onChange: (value: string) => void;
      placeholder: string;
      options: FilterOption[];
    };
  };
  onNewItem: () => void;
  onImport: () => void;
  onExport: () => void;
  onDownloadSample: () => void;
  onSeedData?: () => void;
  onClearData?: () => void;
  children: ReactNode;
}

export function ManagementLayout({
  title,
  subtitle,
  icon,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filters,
  onNewItem,
  onImport,
  onExport,
  onDownloadSample,
  onSeedData,
  onClearData,
  children,
}: ManagementLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* ヘッダーセクション */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    {icon}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">{title}</h1>
                    <p className="text-gray-600 text-lg">{subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={onNewItem}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem onClick={onImport}>
                          <Upload className="mr-2 h-4 w-4" />
                          インポート
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>CSVファイルからデータを一括登録</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem onClick={onExport}>
                          <Download className="mr-2 h-4 w-4" />
                          エクスポート
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>現在のデータをCSV形式でダウンロード</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem onClick={onDownloadSample}>
                          <FileText className="mr-2 h-4 w-4" />
                          サンプル
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>インポート用のCSVテンプレートをダウンロード</p>
                      </TooltipContent>
                    </Tooltip>
                    {(onSeedData || onClearData) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>開発用</DropdownMenuLabel>
                        {onSeedData && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem onClick={onSeedData}>
                                <TestTube className="mr-2 h-4 w-4" />
                                ダミーデータを100件作成
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>テスト用のデータを自動生成</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {onClearData && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem onClick={onClearData} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                全データ削除
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>すべてのデータを削除（注意：復元不可）</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター・検索セクション */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base shadow-sm"
                />
              </div>
            </div>
            {filters && (
              <div className="flex gap-3">
                {filters.filter1 && (
                  <Select value={filters.filter1.value} onValueChange={filters.filter1.onChange}>
                    <SelectTrigger className="w-44 h-12 border-gray-300 rounded-lg shadow-sm">
                      <SelectValue placeholder={filters.filter1.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {filters.filter1.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {filters.filter2 && (
                  <Select value={filters.filter2.value} onValueChange={filters.filter2.onChange}>
                    <SelectTrigger className="w-40 h-12 border-gray-300 rounded-lg shadow-sm">
                      <SelectValue placeholder={filters.filter2.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {filters.filter2.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        {children}
      </div>
    </div>
  );
}