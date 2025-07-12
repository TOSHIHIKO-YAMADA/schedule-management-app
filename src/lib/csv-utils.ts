import { apiClient } from '@/lib/api-client';

export interface CSVExportOptions {
  filename: string;
  endpoint: string;
}

export interface CSVSampleOptions {
  filename: string;
  endpoint: string;
}

/**
 * CSVエクスポート処理
 */
export async function exportToCSV(options: CSVExportOptions): Promise<void> {
  try {
    const response = await apiClient.get(options.endpoint, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', options.filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('エクスポートに失敗しました');
  }
}

/**
 * CSVサンプルダウンロード処理
 */
export async function downloadCSVSample(options: CSVSampleOptions): Promise<void> {
  try {
    const response = await apiClient.get(options.endpoint, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', options.filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Sample download failed:', error);
    throw new Error('サンプルダウンロードに失敗しました');
  }
}

/**
 * 日付フォーマット用のヘルパー関数
 */
export function formatDateForFilename(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 従業員データエクスポート
 */
export async function exportEmployees(): Promise<void> {
  await exportToCSV({
    filename: `employees_${formatDateForFilename()}.csv`,
    endpoint: '/employees/export'
  });
}

/**
 * 顧客データエクスポート
 */
export async function exportCustomers(): Promise<void> {
  await exportToCSV({
    filename: `customers_${formatDateForFilename()}.csv`,
    endpoint: '/customers/export'
  });
}

/**
 * 従業員サンプルダウンロード
 */
export async function downloadEmployeeSample(): Promise<void> {
  await downloadCSVSample({
    filename: 'employees_sample.csv',
    endpoint: '/employees/sample'
  });
}

/**
 * 顧客サンプルダウンロード
 */
export async function downloadCustomerSample(): Promise<void> {
  await downloadCSVSample({
    filename: 'customers_sample.csv',
    endpoint: '/customers/sample'
  });
}