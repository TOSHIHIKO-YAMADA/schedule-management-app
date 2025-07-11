import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// APIクライアントのインスタンス作成
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 開発環境用のユーザーID（Clerk未設定時のフォールバック）
const DEV_USER_ID = 'cm5q9o5u00002mqm1t63ux7m4'; // 開発用デフォルトユーザーID

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    // 開発環境でのユーザーID設定
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      config.headers['x-user-id'] = DEV_USER_ID;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // エラーレスポンスの統一的な処理
    if (error.response) {
      // APIからのエラーレスポンス
      const message = (error.response.data as any)?.error || 'エラーが発生しました';
      console.error(`API Error: ${message}`, error.response.status);
    } else if (error.request) {
      // レスポンスなし（ネットワークエラー等）
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 汎用的なAPIリクエスト関数
export async function apiRequest<T>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient(url, options);
  return response.data;
}

// 便利なヘルパー関数
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>(url, { ...config, method: 'GET' }),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>(url, { ...config, method: 'POST', data }),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>(url, { ...config, method: 'PUT', data }),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>(url, { ...config, method: 'DELETE' }),
};