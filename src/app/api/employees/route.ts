import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  validateRequestBody,
  validateEntityExists,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth, isAdmin, isSuperAdmin } from '@/lib/auth-utils';

// バリデーションスキーマ
const createEmployeeSchema = z.object({
  name: z.string().min(1, '氏名は必須です'),
  nameKana: z.string().min(1, 'ふりがなは必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号は必須です'),
  lineId: z.string().optional(),
  notificationMethod: z.enum(['email', 'line', 'both']).default('email'),
  department: z.string().min(1, '所属は必須です'),
  position: z.string().min(1, '役職は必須です'),
  nearestStation: z.string().min(1, '最寄り駅は必須です'),
  transportation: z.enum(['train', 'car', 'bicycle', 'walk', 'bus']).default('train'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

// GET /api/employees - 従業員一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSuccessResponse(employees);
  });
});

// POST /api/employees - 新規従業員作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    // メールアドレスの重複チェック
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmployee) {
      return createErrorResponse(
        'メールアドレスが既に使用されています',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const employee = await prisma.employee.create({
      data: validatedData,
    });

    return createSuccessResponse(
      employee,
      '従業員が作成されました'
    );
  });
});

// DELETE /api/employees - 一括削除
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const { ids } = body;

    // IDs配列の検証
    if (!Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(
        '削除対象のIDが指定されていません',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // すべてのIDが文字列かチェック
    if (!ids.every(id => typeof id === 'string')) {
      return createErrorResponse(
        '無効なIDが含まれています',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 削除実行
    const result = await prisma.employee.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return createSuccessResponse(
      { count: result.count },
      `${result.count}件の従業員データを削除しました`
    );
  });
});