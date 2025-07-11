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
const updateVehicleUsageSchema = z.object({
  startDateTime: z.string().min(1, '開始日時は必須です').optional(),
  endDateTime: z.string().min(1, '終了日時は必須です').optional(),
  purpose: z.string().min(1, '使用目的は必須です').optional(),
  mileageStart: z.number().int().min(0, '開始走行距離は0以上である必要があります').optional(),
  mileageEnd: z.number().int().min(0, '終了走行距離は0以上である必要があります').optional(),
  vehicleId: z.string().optional(),
  employeeId: z.string().optional(),
  scheduleId: z.string().optional(),
});

// GET /api/vehicle-usages/[id] - 車両使用履歴詳細取得
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const vehicleUsage = await prisma.vehicleUsage.findUnique({
      where: { id: params.id },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            type: true,
            fuelType: true,
            capacity: true,
          },
        },
      },
    });

    if (!vehicleUsage) {
      return createErrorResponse(
        '車両使用履歴が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 走行距離を計算
    const usageWithDistance = {
      ...vehicleUsage,
      distance: vehicleUsage.mileageEnd && vehicleUsage.mileageStart 
        ? vehicleUsage.mileageEnd - vehicleUsage.mileageStart 
        : null,
    };

    return createSuccessResponse(usageWithDistance);
  });
});

// PUT /api/vehicle-usages/[id] - 車両使用履歴更新
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = updateVehicleUsageSchema.parse(body);

    // 既存の使用履歴を確認
    const existingUsage = await prisma.vehicleUsage.findUnique({
      where: { id: params.id },
    });

    if (!existingUsage) {
      return createErrorResponse(
        '車両使用履歴が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 日時の妥当性チェック
    const startDateTime = validatedData.startDateTime 
      ? new Date(validatedData.startDateTime) 
      : existingUsage.startDateTime;
    const endDateTime = validatedData.endDateTime 
      ? new Date(validatedData.endDateTime) 
      : existingUsage.endDateTime;

    if (endDateTime <= startDateTime) {
      return createErrorResponse(
        '終了日時は開始日時より後である必要があります',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 走行距離の妥当性チェック
    const mileageStart = validatedData.mileageStart ?? existingUsage.mileageStart;
    const mileageEnd = validatedData.mileageEnd ?? existingUsage.mileageEnd;

    if (mileageEnd && mileageStart && mileageEnd <= mileageStart) {
      return createErrorResponse(
        '終了走行距離は開始走行距離より大きい必要があります',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 車両の存在確認（変更される場合）
    if (validatedData.vehicleId && validatedData.vehicleId !== existingUsage.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: validatedData.vehicleId },
      });

      if (!vehicle) {
        return createErrorResponse(
          '指定された車両が見つかりません',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // 車両の重複使用チェック
      const conflictingUsage = await prisma.vehicleUsage.findFirst({
        where: {
          id: { not: params.id },
          vehicleId: validatedData.vehicleId,
          OR: [
            {
              AND: [
                { startDateTime: { lte: endDateTime } },
                { endDateTime: { gte: startDateTime } },
              ],
            },
          ],
        },
      });

      if (conflictingUsage) {
        return createErrorResponse(
          '指定された時間帯に車両は既に使用されています',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // 従業員の存在確認（変更される場合）
    if (validatedData.employeeId && validatedData.employeeId !== existingUsage.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: validatedData.employeeId },
      });

      if (!employee) {
        return createErrorResponse(
          '指定された使用者が見つかりません',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // スケジュールの存在確認（変更される場合）
    if (validatedData.scheduleId && validatedData.scheduleId !== existingUsage.scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: validatedData.scheduleId },
      });

      if (!schedule) {
        return createErrorResponse(
          '指定されたスケジュールが見つかりません',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // 車両使用履歴を更新
    const updatedUsage = await prisma.vehicleUsage.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        startDateTime: validatedData.startDateTime ? startDateTime : undefined,
        endDateTime: validatedData.endDateTime ? endDateTime : undefined,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            type: true,
          },
        },
      },
    });

    // 走行距離を計算
    const usageWithDistance = {
      ...updatedUsage,
      distance: updatedUsage.mileageEnd && updatedUsage.mileageStart 
        ? updatedUsage.mileageEnd - updatedUsage.mileageStart 
        : null,
    };

    return createSuccessResponse(
      usageWithDistance,
      '車両使用履歴が更新されました'
    );

  });
});

// DELETE /api/vehicle-usages/[id] - 車両使用履歴削除
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    // 既存の使用履歴を確認
    const existingUsage = await prisma.vehicleUsage.findUnique({
      where: { id: params.id },
    });

    if (!existingUsage) {
      return createErrorResponse(
        '車両使用履歴が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 車両使用履歴を削除
    await prisma.vehicleUsage.delete({
      where: { id: params.id },
    });

    return createSuccessResponse(
      null,
      '車両使用履歴が削除されました'
    );

  });
});