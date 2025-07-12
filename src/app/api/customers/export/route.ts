import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-utils';

// GET /api/customers/export - 顧客データCSVエクスポート
export async function GET(request: NextRequest) {
  return withAuth(request, async (request, user) => {
    try {
      const customers = await prisma.customer.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      // CSVヘッダー
      const csvHeader = '会社名,住所,電話番号,担当者名,メールアドレス,ウェブサイト,業種,アクティブ\n';
      
      // CSVデータ
      const csvData = customers.map(customer => {
        return [
          `"${customer.name}"`,
          `"${customer.address}"`,
          `"${customer.phone}"`,
          `"${customer.contactPerson}"`,
          `"${customer.email}"`,
          `"${customer.website || ''}"`,
          `"${customer.industry || ''}"`,
          customer.isActive ? 'true' : 'false'
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvData;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="customers.csv"',
        },
      });
    } catch (error) {
      console.error('Export failed:', error);
      return NextResponse.json(
        { error: 'エクスポートに失敗しました' },
        { status: 500 }
      );
    }
  });
}