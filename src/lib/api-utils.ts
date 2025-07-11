import { NextResponse } from 'next/server';
import { z } from 'zod';

// 統一されたAPIレスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

// 統一されたエラーレスポンス作成
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

// 統一された成功レスポンス作成
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

// エラーハンドリングユーティリティ
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('APIエラー:', error);

  // Zodバリデーションエラー
  if (error instanceof z.ZodError) {
    return createErrorResponse(
      'バリデーションエラー',
      400,
      error.errors
    );
  }

  // Prismaエラー
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    
    switch (prismaError.code) {
      case 'P2002':
        return createErrorResponse(
          'データが既に存在します（一意制約違反）',
          409
        );
      case 'P2025':
        return createErrorResponse(
          'データが見つかりません',
          404
        );
      case 'P2003':
        return createErrorResponse(
          '関連データが見つかりません（外部キー制約違反）',
          400
        );
      case 'P2014':
        return createErrorResponse(
          'データの整合性に問題があります',
          400
        );
      default:
        return createErrorResponse(
          'データベースエラーが発生しました',
          500
        );
    }
  }

  // 一般的なエラー
  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }

  // 不明なエラー
  return createErrorResponse(
    '予期しないエラーが発生しました',
    500
  );
}

// APIルートラッパー関数
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// 共通バリデーション関数
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): T {
  return schema.parse(body);
}

// エンティティ存在確認関数
export async function validateEntityExists<T>(
  entity: T | null,
  entityName: string
): Promise<T> {
  if (!entity) {
    throw new Error(`${entityName}が見つかりません`);
  }
  return entity;
}

// ログ記録ユーティリティ
export function logApiRequest(
  method: string,
  url: string,
  userId?: string
) {
  console.log(`[API] ${method} ${url}`, userId ? `(User: ${userId})` : '');
}

// HTTPステータスコード定数
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;