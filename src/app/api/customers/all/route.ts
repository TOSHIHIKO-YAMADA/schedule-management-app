import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-utils';

// DELETE /api/customers/all - 全顧客削除
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const deletedCustomers = await prisma.customer.deleteMany({});

    return createSuccessResponse(
      { count: deletedCustomers.count },
      `${deletedCustomers.count}件の顧客データを削除しました`,
      HTTP_STATUS.OK
    );
  });
});