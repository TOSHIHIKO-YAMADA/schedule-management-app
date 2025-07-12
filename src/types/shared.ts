/**
 * 共通のページネーション情報
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

/**
 * 共通のフィルターオプション
 */
export interface FilterOption {
  value: string;
  label: string;
}

/**
 * 管理画面の基本プロパティ
 */
export interface BaseManagementProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

/**
 * データテーブルの選択機能プロパティ
 */
export interface SelectionProps {
  selectedItems: Set<string>;
  onSelectItem: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
}

/**
 * CSVインポート結果
 */
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  message?: string;
}

/**
 * API応答の基本形式
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

/**
 * アクティブ状態を持つエンティティの基本形式
 */
export interface ActiveEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ステータスフィールドを持つエンティティ（従業員）
 */
export interface EntityWithStatus extends ActiveEntity {
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * isActiveフィールドを持つエンティティ（顧客）
 */
export interface EntityWithIsActive extends ActiveEntity {
  isActive: boolean;
}

/**
 * 管理画面の共通アクション
 */
export interface ManagementActions {
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  onImport: () => void;
  onExport: () => void;
  onDownloadSample: () => void;
  onSeedData?: () => void;
  onClearData?: () => void;
}

/**
 * データテーブルの基本設定
 */
export interface DataTableConfig {
  enableSelection: boolean;
  enablePagination: boolean;
  enableSorting: boolean;
  enableFiltering: boolean;
  pageSize: number;
}

/**
 * 検索・フィルタリングの設定
 */
export interface FilterConfig {
  searchFields: string[];
  filters: {
    [key: string]: {
      options: FilterOption[];
      defaultValue: string;
    };
  };
}

/**
 * インポートダイアログの設定
 */
export interface ImportDialogConfig {
  title: string;
  description: string;
  endpoint: string;
  sampleEndpoint: string;
  instructions: {
    title: string;
    items: string[];
  };
  entityName: string;
}

/**
 * 管理画面のレイアウト設定
 */
export interface ManagementLayoutConfig {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  entityName: string;
  filters?: {
    filter1?: {
      placeholder: string;
      options: FilterOption[];
    };
    filter2?: {
      placeholder: string;
      options: FilterOption[];
    };
  };
}