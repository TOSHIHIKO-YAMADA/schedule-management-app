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
const createCustomerSchema = z.object({
  name: z.string().min(1, '顧客名は必須です'),
  address: z.string().min(1, '住所は必須です'),
  phone: z.string().min(1, '電話番号は必須です'),
  contactPerson: z.string().min(1, '担当者名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/customers - 顧客一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // クエリ条件の構築
    const where: any = {};
    
    if (industry) {
      where.industry = industry;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return createSuccessResponse(customers);
  });
});

// POST /api/customers - 顧客作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(createCustomerSchema, body);

    // メールアドレスの重複チェック
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    if (existingCustomer) {
      return createErrorResponse(
        'メールアドレスが既に使用されています',
        HTTP_STATUS.CONFLICT
      );
    }

    const customer = await prisma.customer.create({
      data: validatedData,
    });

    return createSuccessResponse(
      customer,
      '顧客が作成されました',
      HTTP_STATUS.CREATED
    );
  });
});