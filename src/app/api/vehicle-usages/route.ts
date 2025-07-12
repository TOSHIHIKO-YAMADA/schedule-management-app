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
const createVehicleUsageSchema = z.object({
  startDate: z.string().min(1, '開始日時は必須です'),
  endDate: z.string().min(1, '終了日時は必須です'),
  purpose: z.string().min(1, '使用目的は必須です'),
  startMileage: z.number().int().min(0, '開始走行距離は0以上である必要があります').optional(),
  endMileage: z.number().int().min(0, '終了走行距離は0以上である必要があります').optional(),
  vehicleId: z.string().min(1, '車両は必須です'),
  employeeId: z.string().min(1, '使用者は必須です'),
  scheduleId: z.string().min(1, 'スケジュールは必須です'),
});

// GET /api/vehicle-usages - 車両使用履歴一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const employeeId = searchParams.get('employeeId');
    const scheduleId = searchParams.get('scheduleId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // クエリ条件の構築
    const where: any = {};
    
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (scheduleId) {
      where.scheduleId = scheduleId;
    }

    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) {
        where.startDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.startDate.lte = new Date(dateTo);
      }
    }

    const vehicleUsages = await prisma.vehicleUsage.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // 走行距離を計算
    const usagesWithDistance = vehicleUsages.map(usage => ({
      ...usage,
      distance: usage.endMileage && usage.startMileage 
        ? usage.endMileage - usage.startMileage 
        : null,
    }));

    return createSuccessResponse(usagesWithDistance);
  });
});

// POST /api/vehicle-usages - 車両使用履歴作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(createVehicleUsageSchema, body);

    // 日時の妥当性チェック
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (endDate <= startDate) {
      return createErrorResponse(
        '終了日時は開始日時より後である必要があります',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 走行距離の妥当性チェック
    if (validatedData.endMileage && validatedData.startMileage) {
      if (validatedData.endMileage <= validatedData.startMileage) {
        return createErrorResponse(
          '終了走行距離は開始走行距離より大きい必要があります',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // 車両の存在確認
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
        vehicleId: validatedData.vehicleId,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } },
            ],
          },
        ],
      },
    });

    if (conflictingUsage) {
      return createErrorResponse(
        '指定された時間帯に車両は既に使用されています',
        HTTP_STATUS.CONFLICT
      );
    }

    // 従業員の存在確認
    const employee = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: '指定された使用者が見つかりません',
        },
        { status: 400 }
      );
    }

    // スケジュールの存在確認
    const schedule = await prisma.schedule.findUnique({
      where: { id: validatedData.scheduleId },
    });

    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          error: '指定されたスケジュールが見つかりません',
        },
        { status: 400 }
      );
    }

    // 車両使用履歴を作成
    const vehicleUsage = await prisma.vehicleUsage.create({
      data: {
        ...validatedData,
        startDate,
        endDate,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
          },
        },
      },
    });

    // 走行距離を計算
    const usageWithDistance = {
      ...vehicleUsage,
      distance: vehicleUsage.endMileage && vehicleUsage.startMileage 
        ? vehicleUsage.endMileage - vehicleUsage.startMileage 
        : null,
    };

    return createSuccessResponse(
      usageWithDistance,
      '車両使用履歴が作成されました',
      HTTP_STATUS.CREATED
    );

  });
});