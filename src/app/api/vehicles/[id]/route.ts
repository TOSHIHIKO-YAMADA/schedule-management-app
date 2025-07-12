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
const updateVehicleSchema = z.object({
  name: z.string().min(1, '車両名は必須です').optional(),
  licensePlate: z.string().min(1, 'ナンバープレートは必須です').optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']).optional(),
  capacity: z.number().min(1).max(50).optional(),
  mileage: z.number().min(0).optional(),
  inspectionDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  insuranceDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

// GET /api/vehicles/[id] - 車両詳細取得
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            usageHistory: true,
          },
        },
        usageHistory: {
          take: 10,
          orderBy: {
            startDate: 'desc',
          },
        },
      },
    });

    if (!vehicle) {
      return createErrorResponse(
        '車両が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 車検日・保険の警告情報を追加
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const vehicleWithWarning = {
      ...vehicle,
      alerts: {
        inspection: vehicle.inspectionDate ? {
          date: vehicle.inspectionDate,
          isExpired: vehicle.inspectionDate < today,
          isExpiringSoon: vehicle.inspectionDate <= thirtyDaysFromNow && vehicle.inspectionDate >= today,
          daysUntilExpiry: Math.ceil((vehicle.inspectionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        } : null,
        insurance: vehicle.insuranceDate ? {
          date: vehicle.insuranceDate,
          isExpired: vehicle.insuranceDate < today,
          isExpiringSoon: vehicle.insuranceDate <= thirtyDaysFromNow && vehicle.insuranceDate >= today,
          daysUntilExpiry: Math.ceil((vehicle.insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        } : null,
      },
    };

    return createSuccessResponse(vehicleWithWarning);
  });
});

// PUT /api/vehicles/[id] - 車両更新
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = updateVehicleSchema.parse(body);

    // 既存の車両を確認
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!existingVehicle) {
      return createErrorResponse(
        '車両が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // ナンバープレートの重複チェック（自分以外）
    if (validatedData.licensePlate && validatedData.licensePlate !== existingVehicle.licensePlate) {
      const existingLicensePlate = await prisma.vehicle.findFirst({
        where: {
          licensePlate: validatedData.licensePlate,
          id: { not: params.id },
        },
      });

      if (existingLicensePlate) {
        return createErrorResponse(
          'ナンバープレートが既に使用されています',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // 車両情報を更新
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: validatedData,
    });

    return createSuccessResponse(
      updatedVehicle,
      '車両情報が更新されました'
    );

  });
});

// DELETE /api/vehicles/[id] - 車両削除
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    // 既存の車両を確認
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            usageHistory: true,
          },
        },
      },
    });

    if (!existingVehicle) {
      return createErrorResponse(
        '車両が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 関連データがある場合は論理削除
    if (existingVehicle._count.usageHistory > 0) {
      // 論理削除（isActiveをfalseに設定）
      const deactivatedVehicle = await prisma.vehicle.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return createSuccessResponse(
        deactivatedVehicle,
        '車両を無効化しました（使用履歴があるため物理削除は行われませんでした）'
      );
    } else {
      // 物理削除
      await prisma.vehicle.delete({
        where: { id: params.id },
      });

      return createSuccessResponse(
        null,
        '車両が削除されました'
      );
    }

  });
});