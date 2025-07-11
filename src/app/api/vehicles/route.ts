import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-utils';

// バリデーションスキーマ
const createVehicleSchema = z.object({
  name: z.string().min(1, '車両名は必須です'),
  licensePlate: z.string().min(1, 'ナンバープレートは必須です'),
  inspectionDate: z.string().min(1, '車検日は必須です'),
  type: z.enum(['sedan', 'van', 'truck']).default('sedan'),
  capacity: z.number().int().min(1, '乗車定員は1以上である必要があります').default(5),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric']).default('gasoline'),
  isActive: z.boolean().default(true),
});

// GET /api/vehicles - 車両一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const fuelType = searchParams.get('fuelType');
    const isActive = searchParams.get('isActive');
    const available = searchParams.get('available');
    const date = searchParams.get('date');

    // クエリ条件の構築
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (fuelType) {
      where.fuelType = fuelType;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // 特定日に利用可能な車両のフィルタリング
    if (available === 'true' && date) {
      where.NOT = {
        schedules: {
          some: {
            AND: [
              { startDate: { lte: date } },
              { endDate: { gte: date } },
              { status: { not: 'cancelled' } },
            ],
          },
        },
      };
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        _count: {
          select: {
            schedules: true,
            vehicleUsages: true,
          },
        },
        schedules: available === 'true' ? false : {
          where: {
            status: { not: 'cancelled' },
            startDate: { gte: new Date().toISOString().split('T')[0] },
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            startTime: true,
            endTime: true,
          },
          orderBy: {
            startDate: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return createSuccessResponse(vehicles);
  });
});

// POST /api/vehicles - 車両作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(createVehicleSchema, body);

    // ナンバープレートの重複チェック
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        licensePlate: validatedData.licensePlate,
      },
    });

    if (existingVehicle) {
      return createErrorResponse(
        'ナンバープレートが既に使用されています',
        HTTP_STATUS.CONFLICT
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: validatedData,
    });

    return createSuccessResponse(
      vehicle,
      '車両が作成されました',
      HTTP_STATUS.CREATED
    );
  });
});