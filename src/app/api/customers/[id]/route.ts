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
const updateCustomerSchema = z.object({
  name: z.string().min(1, '顧客名は必須です').optional(),
  address: z.string().min(1, '住所は必須です').optional(),
  phone: z.string().min(1, '電話番号は必須です').optional(),
  contactPerson: z.string().min(1, '担当者名は必須です').optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/customers/[id] - 顧客詳細取得
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            schedules: true,
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
          take: 10,
        },
      },
    });

    if (!customer) {
      return createErrorResponse(
        '顧客が見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse(customer);
  });
});

// PUT /api/customers/[id] - 顧客更新
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    // 既存の顧客を確認
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: '顧客が見つかりません',
        },
        { status: 404 }
      );
    }

    // メールアドレスの重複チェック（自分以外）
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const existingEmail = await prisma.customer.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'メールアドレスが既に使用されています',
          },
          { status: 400 }
        );
      }
    }

    // 顧客情報を更新
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: validatedData,
    });

    return createSuccessResponse(
      updatedCustomer,
      '顧客情報が更新されました'
    );

  });
});

// DELETE /api/customers/[id] - 顧客削除
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    // 既存の顧客を確認
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
        schedules: {
          where: {
            status: { in: ['scheduled', 'in_progress'] },
          },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: '顧客が見つかりません',
        },
        { status: 404 }
      );
    }

    // アクティブなスケジュールがある場合は削除不可
    if (existingCustomer.schedules.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'アクティブなスケジュールが存在するため削除できません',
          details: `${existingCustomer.schedules.length}件のアクティブなスケジュールがあります`,
        },
        { status: 400 }
      );
    }

    // 関連データがある場合は論理削除
    if (existingCustomer._count.schedules > 0) {
      // 論理削除（isActiveをfalseに設定）
      const deactivatedCustomer = await prisma.customer.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        data: deactivatedCustomer,
        message: '顧客を無効化しました（関連データがあるため物理削除は行われませんでした）',
      });
    } else {
      // 物理削除
      await prisma.customer.delete({
        where: { id: params.id },
      });

      return createSuccessResponse(
        null,
        '顧客が削除されました'
      );
    }

  });
});