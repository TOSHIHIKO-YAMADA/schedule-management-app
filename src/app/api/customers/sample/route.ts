import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';

// GET /api/customers/sample - 顧客データCSVサンプルダウンロード
export async function GET(request: NextRequest) {
  return withAuth(request, async (request, user) => {
    try {
      const csvHeader = '会社名,住所,電話番号,担当者名,メールアドレス,ウェブサイト,業種,アクティブ\n';
      const sampleData = [
        '"株式会社サンプル","東京都渋谷区1-1-1","03-1234-5678","田中太郎","tanaka@sample.co.jp","https://www.sample.co.jp","IT・通信","true"',
        '"有限会社テスト","大阪府大阪市2-2-2","06-9876-5432","山田花子","yamada@test.co.jp","","製造業","true"',
        '"合同会社デモ","愛知県名古屋市3-3-3","052-1111-2222","佐藤次郎","sato@demo.co.jp","https://www.demo.co.jp","サービス業","false"'
      ].join('\n');

      const csv = csvHeader + sampleData;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="customers_sample.csv"',
        },
      });
    } catch (error) {
      console.error('Sample download failed:', error);
      return NextResponse.json(
        { error: 'サンプルダウンロードに失敗しました' },
        { status: 500 }
      );
    }
  });
}