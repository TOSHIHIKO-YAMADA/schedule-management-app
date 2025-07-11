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
  employeeNumber: z.string().min(1, '従業員番号は必須です').optional(),
  name: z.string().min(1, '氏名は必須です').optional(),
  nameKana: z.string().min(1, 'フリガナは必須です').optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  phone: z.string().min(1, '電話番号は必須です').optional(),
  lineId: z.string().optional(),
  notificationMethod: z.enum(['email', 'line', 'both']).optional(),
  nearestStation: z.string().min(1, '最寄り駅は必須です').optional(),
  transportation: z.enum(['train', 'car', 'bicycle', 'walk']).optional(),
  role: z.enum(['super', 'admin', 'limited_admin', 'general']).optional(),
  department: z.string().min(1, '部署は必須です').optional(),
  isActive: z.boolean().optional(),
});

// GET /api/employees/[id] - 従業員詳細取得
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const employee = await validateEntityExists(
      await prisma.employee.findUnique({
        where: { id: params.id },
        include: {
          notificationSettings: true,
          _count: {
            select: {
              createdSchedules: true,
              assignedTasks: true,
              scheduleAttendees: true,
            },
          },
          createdSchedules: {
            where: {
              status: { not: 'cancelled' },
            },
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true,
            },
            orderBy: {
              startDate: 'desc',
            },
            take: 5,
          },
        },
      }),
      '従業員'
    );

    // 自分の情報または管理者権限チェック
    const isOwnProfile = user.id === params.id;
    const hasAdminAccess = isAdmin(user.role);

    if (!isOwnProfile && !hasAdminAccess) {
      // 基本情報のみ返す
      return createSuccessResponse({
        id: employee.id,
        name: employee.name,
        department: employee.department,
        role: employee.role,
        isActive: employee.isActive,
      });
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
    const validatedData = validateRequestBody(updateEmployeeSchema, body);

    const existingEmployee = await validateEntityExists(
      await prisma.employee.findUnique({
        where: { id: params.id },
      }),
      '従業員'
    );

    // 権限チェック
    const isOwnProfile = user.id === params.id;
    const hasAdminAccess = isAdmin(user.role);

    if (!isOwnProfile && !hasAdminAccess) {
      return createErrorResponse(
        '他の従業員情報を更新する権限がありません',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // 自分のプロフィールの場合は更新可能フィールドを制限
    if (isOwnProfile && !hasAdminAccess) {
      const allowedFields = ['phone', 'lineId', 'notificationMethod', 'nearestStation', 'transportation'];
      const restrictedFields = Object.keys(validatedData).filter(key => !allowedFields.includes(key));
      
      if (restrictedFields.length > 0) {
        return createErrorResponse(
          `以下のフィールドは更新できません: ${restrictedFields.join(', ')}`,
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    // 従業員番号とメールアドレスの重複チェック（自分以外）
    if (validatedData.employeeNumber || validatedData.email) {
      const duplicateCheck: any = {};
      
      if (validatedData.employeeNumber) {
        duplicateCheck.employeeNumber = validatedData.employeeNumber;
      }
      
      if (validatedData.email) {
        duplicateCheck.email = validatedData.email;
      }

      const existingDuplicate = await prisma.employee.findFirst({
        where: {
          id: { not: params.id },
          OR: Object.keys(duplicateCheck).map(key => ({
            [key]: duplicateCheck[key]
          })),
        },
      });

      if (existingDuplicate) {
        const field = existingDuplicate.employeeNumber === validatedData.employeeNumber 
          ? '従業員番号' : 'メールアドレス';
        return createErrorResponse(
          `${field}が既に使用されています`,
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // 従業員情報を更新
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        notificationSettings: true,
      },
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
    // スーパー管理者権限チェック
    if (!isSuperAdmin(user.role)) {
      return createErrorResponse(
        '従業員の削除権限がありません（スーパー管理者のみ）',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // 自分自身は削除不可
    if (user.id === params.id) {
      return createErrorResponse(
        '自分自身を削除することはできません',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingEmployee = await validateEntityExists(
      await prisma.employee.findUnique({
        where: { id: params.id },
        include: {
          _count: {
            select: {
              createdSchedules: true,
              assignedTasks: true,
              scheduleAttendees: true,
            },
          },
        },
      }),
      '従業員'
    );

    // 関連データがある場合は論理削除
    const hasRelatedData = 
      existingEmployee._count.createdSchedules > 0 ||
      existingEmployee._count.assignedTasks > 0 ||
      existingEmployee._count.scheduleAttendees > 0;

    if (hasRelatedData) {
      // 論理削除（isActiveをfalseに設定）
      const deactivatedEmployee = await prisma.employee.update({
        where: { id: params.id },
        data: { isActive: false },
        include: {
          notificationSettings: true,
        },
      });

      return createSuccessResponse(
        deactivatedEmployee,
        '従業員を無効化しました（関連データがあるため物理削除は行われませんでした）'
      );
    } else {
      // 物理削除
      await prisma.$transaction(async (tx) => {
        // 通知設定を削除
        await tx.notificationSettings.deleteMany({
          where: { userId: params.id },
        });

        // 従業員を削除
        await tx.employee.delete({
          where: { id: params.id },
        });
      });

      return createSuccessResponse(
        null,
        '従業員が削除されました'
      );
    }
  });
});