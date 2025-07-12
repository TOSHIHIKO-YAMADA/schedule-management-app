import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth, isAdmin, isSuperAdmin } from '@/lib/auth-utils';

// バリデーションスキーマ
const createVehicleSchema = z.object({
  name: z.string().min(1, '車両名は必須です'),
  licensePlate: z.string().min(1, 'ナンバープレートは必須です'),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']).default('gasoline'),
  capacity: z.number().min(1).max(50).optional(),
  mileage: z.number().min(0).optional(),
  inspectionDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  insuranceDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

// GET /api/vehicles - 車両一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const fuelType = searchParams.get('fuelType') || 'all';

    // 検索条件構築
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.isActive = status === 'active';
    }

    if (fuelType !== 'all') {
      where.fuelType = fuelType;
    }

    // 車検期限が近い車両の検出（30日以内）
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            usageHistory: true,
          },
        },
      },
    });

    // 車検期限アラートフラグを追加
    const vehiclesWithAlerts = vehicles.map(vehicle => ({
      ...vehicle,
      inspectionAlert: vehicle.inspectionDate && vehicle.inspectionDate <= thirtyDaysFromNow,
      insuranceAlert: vehicle.insuranceDate && vehicle.insuranceDate <= thirtyDaysFromNow,
    }));

    return createSuccessResponse(vehiclesWithAlerts);
  });
});

// POST /api/vehicles - 新規車両作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = createVehicleSchema.parse(body);

    // ナンバープレートの重複チェック
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: validatedData.licensePlate },
    });

    if (existingVehicle) {
      return createErrorResponse(
        'ナンバープレートが既に登録されています',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: validatedData,
    });

    return createSuccessResponse(
      vehicle,
      '車両が登録されました'
    );
  });
});

// DELETE /api/vehicles - 一括削除
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
    const result = await prisma.vehicle.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return createSuccessResponse(
      { count: result.count },
      `${result.count}件の車両データを削除しました`
    );
  });
});