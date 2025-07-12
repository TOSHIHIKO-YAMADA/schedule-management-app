import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { createErrorResponse, HTTP_STATUS } from '@/lib/api-utils';

// ユーザーロール定義
export type UserRole = 'super' | 'admin' | 'limited_admin' | 'general';

// 権限レベル定義
export const PERMISSION_LEVELS = {
  super: 4,
  admin: 3,
  limited_admin: 2,
  general: 1,
} as const;

// API権限設定
export const API_PERMISSIONS = {
  // 従業員管理
  'GET /api/employees': ['general'],
  'POST /api/employees': ['admin', 'super'],
  'PUT /api/employees': ['limited_admin', 'admin', 'super'], // 自分の情報は別途チェック
  'DELETE /api/employees': ['super'],

  // 顧客管理
  'GET /api/customers': ['general'],
  'POST /api/customers': ['limited_admin', 'admin', 'super'],
  'PUT /api/customers': ['limited_admin', 'admin', 'super'],
  'DELETE /api/customers': ['admin', 'super'],
  'GET /api/customers/export': ['general'],
  'POST /api/customers/import': ['admin', 'super'],
  'GET /api/customers/sample': ['general'],
  'POST /api/customers/seed': ['super'],

  // 車両管理
  'GET /api/vehicles': ['general'],
  'POST /api/vehicles': ['limited_admin', 'admin', 'super'],
  'PUT /api/vehicles': ['limited_admin', 'admin', 'super'],
  'DELETE /api/vehicles': ['admin', 'super'],

  // スケジュール管理
  'GET /api/schedules': ['general'],
  'POST /api/schedules': ['general'],
  'PUT /api/schedules': ['general'], // 作成者チェックは別途
  'DELETE /api/schedules': ['general'], // 作成者チェックは別途

  // タスク管理
  'GET /api/tasks': ['general'],
  'POST /api/tasks': ['general'],
  'PUT /api/tasks': ['general'], // 担当者・作成者チェックは別途
  'DELETE /api/tasks': ['general'], // 作成者チェックは別途

  // 車両使用履歴
  'GET /api/vehicle-usages': ['general'],
  'POST /api/vehicle-usages': ['general'],
  'PUT /api/vehicle-usages': ['general'],
  'DELETE /api/vehicle-usages': ['limited_admin', 'admin', 'super'],
} as const;

// 現在のユーザー情報を取得
export async function getCurrentUser(request: NextRequest) {
  // 開発環境では開発用ヘッダーを優先
  const isDevelopment = process.env.NODE_ENV === 'development';
  const skipAuth = process.env.SKIP_AUTH === 'true';
  
  if (isDevelopment && skipAuth) {
    // 開発用：ダミーユーザーを返す
    return {
      id: 'dev-user-id',
      name: '開発ユーザー',
      email: 'dev@example.com',
      role: 'super',
      isActive: true,
    };
  }

  // 本番環境またはClerk認証有効時
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return null;
    }

    // ClerkのuserIdをemployeeテーブルのclerkIdで検索
    const user = await prisma.employee.findFirst({
      where: { 
        OR: [
          { clerkId: clerkUserId },
          // フォールバック: メールアドレスでマッチング（初回ログイン時）
          { email: await getClerkUserEmail(clerkUserId) }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        clerkId: true,
      },
    });

    // ClerkIDが設定されていない場合は更新
    if (user && !user.clerkId) {
      await prisma.employee.update({
        where: { id: user.id },
        data: { clerkId: clerkUserId },
      });
    }

    return user;
  } catch (error) {
    console.error('Clerk認証エラー:', error);
    return null;
  }
}

// Clerkユーザーのメールアドレスを取得（ヘルパー関数）
async function getClerkUserEmail(clerkUserId: string): Promise<string | null> {
  try {
    // 本来はClerk SDKを使用してユーザー情報を取得
    // const clerkUser = await clerkClient.users.getUser(clerkUserId);
    // return clerkUser.emailAddresses[0]?.emailAddress || null;
    
    // 暫定実装：環境に応じて適切に実装
    return null;
  } catch (error) {
    console.error('Clerkユーザーメール取得エラー:', error);
    return null;
  }
}

// 権限階層定義
const ROLE_HIERARCHY: Record<UserRole, number> = {
  general: 1,
  limited_admin: 2,
  admin: 3,
  super: 4,
};

// 権限チェック関数（階層考慮）
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  return requiredRoles.some(role => userLevel >= ROLE_HIERARCHY[role]);
}

// API権限チェック
export function checkApiPermission(method: string, pathname: string, userRole: UserRole): boolean {
  const key = `${method} ${pathname}` as keyof typeof API_PERMISSIONS;
  const requiredRoles = API_PERMISSIONS[key];
  
  if (!requiredRoles) {
    // 権限設定がない場合はアクセス拒否
    return false;
  }

  return hasPermission(userRole, requiredRoles);
}

// 認証ミドルウェア関数
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<Response>
) {
  // 開発環境でも適切な認証チェックを実行

  const user = await getCurrentUser(request);
  
  if (!user) {
    return createErrorResponse(
      '認証が必要です',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (!user.isActive) {
    return createErrorResponse(
      'アカウントが無効です',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // API権限チェック
  const method = request.method;
  const pathname = new URL(request.url).pathname;
  
  if (!checkApiPermission(method, pathname, user.role as UserRole)) {
    return createErrorResponse(
      'この操作を実行する権限がありません',
      HTTP_STATUS.FORBIDDEN
    );
  }

  return handler(request, user);
}

// エンティティ所有者チェック
export async function checkEntityOwnership(
  entityType: 'schedule' | 'task',
  entityId: string,
  userId: string
): Promise<boolean> {
  try {
    switch (entityType) {
      case 'schedule':
        const schedule = await prisma.schedule.findUnique({
          where: { id: entityId },
          select: { createdBy: true },
        });
        return schedule?.createdBy === userId;

      case 'task':
        const task = await prisma.task.findUnique({
          where: { id: entityId },
          select: { createdBy: true, assignedTo: true },
        });
        return task?.createdBy === userId || task?.assignedTo === userId;

      default:
        return false;
    }
  } catch (error) {
    console.error('所有者チェックエラー:', error);
    return false;
  }
}

// 管理者権限チェック
export function isAdmin(userRole: UserRole): boolean {
  return ['admin', 'super'].includes(userRole);
}

// スーパー管理者権限チェック
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'super';
}