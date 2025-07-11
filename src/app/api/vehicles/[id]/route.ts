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
  inspectionDate: z.string().min(1, '車検日は必須です').optional(),
  type: z.enum(['sedan', 'van', 'truck']).optional(),
  capacity: z.number().int().min(1, '乗車定員は1以上である必要があります').optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric']).optional(),
  isActive: z.boolean().optional(),
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
            schedules: true,
            vehicleUsages: true,
          },
        },
        schedules: {
          where: {
            status: { not: 'cancelled' },
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      return createErrorResponse(
        '車両が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 車検日の警告情報を追加
    const inspectionDate = new Date(vehicle.inspectionDate);
    const today = new Date();
    const daysUntilInspection = Math.ceil((inspectionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const vehicleWithWarning = {
      ...vehicle,
      inspectionWarning: {
        daysUntilInspection,
        isExpired: daysUntilInspection < 0,
        isExpiringSoon: daysUntilInspection <= 30 && daysUntilInspection >= 0,
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
      return NextResponse.json(
        {
          success: false,
          error: '車両が見つかりません',
        },
        { status: 404 }
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
        return NextResponse.json(
          {
            success: false,
            error: 'ナンバープレートが既に使用されています',
          },
          { status: 400 }
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
            schedules: true,
            vehicleUsages: true,
          },
        },
        schedules: {
          where: {
            status: { in: ['scheduled', 'in_progress'] },
          },
        },
      },
    });

    if (!existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          error: '車両が見つかりません',
        },
        { status: 404 }
      );
    }

    // アクティブなスケジュールがある場合は削除不可
    if (existingVehicle.schedules.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'アクティブなスケジュールが存在するため削除できません',
          details: `${existingVehicle.schedules.length}件のアクティブなスケジュールがあります`,
        },
        { status: 400 }
      );
    }

    // 関連データがある場合は論理削除
    if (existingVehicle._count.schedules > 0 || existingVehicle._count.vehicleUsages > 0) {
      // 論理削除（isActiveをfalseに設定）
      const deactivatedVehicle = await prisma.vehicle.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        data: deactivatedVehicle,
        message: '車両を無効化しました（関連データがあるため物理削除は行われませんでした）',
      });
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