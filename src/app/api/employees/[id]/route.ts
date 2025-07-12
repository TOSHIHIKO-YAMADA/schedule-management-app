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
const updateEmployeeSchema = z.object({
  name: z.string().min(1, '氏名は必須です').optional(),
  nameKana: z.string().min(1, 'ふりがなは必須です').optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  phone: z.string().min(1, '電話番号は必須です').optional(),
  lineId: z.string().optional(),
  notificationMethod: z.enum(['email', 'line', 'both']).optional(),
  department: z.string().min(1, '所属は必須です').optional(),
  position: z.string().min(1, '役職は必須です').optional(),
  nearestStation: z.string().min(1, '最寄り駅は必須です').optional(),
  transportation: z.enum(['train', 'car', 'bicycle', 'walk', 'bus']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// GET /api/employees/[id] - 従業員詳細取得
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!employee) {
      return createErrorResponse(
        '従業員が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse(employee);
  });
});

// PUT /api/employees/[id] - 従業員更新
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = updateEmployeeSchema.parse(body);

    // 既存の従業員を確認
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!existingEmployee) {
      return createErrorResponse(
        '従業員が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // メールアドレスの重複チェック（自分以外）
    if (validatedData.email && validatedData.email !== existingEmployee.email) {
      const existingEmail = await prisma.employee.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id },
        },
      });

      if (existingEmail) {
        return createErrorResponse(
          'メールアドレスが既に使用されています',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // 従業員情報を更新
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: validatedData,
    });

    return createSuccessResponse(
      updatedEmployee,
      '従業員情報が更新されました'
    );
  });
});

// DELETE /api/employees/[id] - 従業員削除
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    // 既存の従業員を確認
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!existingEmployee) {
      return createErrorResponse(
        '従業員が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 従業員を削除
    await prisma.employee.delete({
      where: { id: params.id },
    });

    return createSuccessResponse(
      null,
      '従業員が削除されました'
    );
  });
});