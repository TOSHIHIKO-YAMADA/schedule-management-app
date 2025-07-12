import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-utils';

// POST /api/customers/import - 顧客データCSVインポート
export async function POST(request: NextRequest) {
  return withAuth(request, async (request, user) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { error: 'ファイルが選択されていません' },
          { status: 400 }
        );
      }

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return NextResponse.json(
          { error: 'CSVファイルにデータが含まれていません' },
          { status: 400 }
        );
      }

      // ヘッダー行をスキップ
      const dataLines = lines.slice(1);
      
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (!line) continue;

        try {
          // CSV行をパース（簡単な実装）
          const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
          
          if (columns.length < 8) {
            results.failed++;
            results.errors.push(`行${i + 2}: 列数が不足しています`);
            continue;
          }

          const [name, address, phone, contactPerson, email, website, industry, isActiveStr] = columns;
          
          // バリデーション
          if (!name || !address || !phone || !contactPerson || !email) {
            results.failed++;
            results.errors.push(`行${i + 2}: 必須項目が不足しています`);
            continue;
          }

          const isActive = isActiveStr.toLowerCase() === 'true';

          // 重複チェック
          const existingCustomer = await prisma.customer.findFirst({
            where: { email }
          });

          if (existingCustomer) {
            results.failed++;
            results.errors.push(`行${i + 2}: メールアドレス ${email} は既に存在します`);
            continue;
          }

          // 顧客作成
          await prisma.customer.create({
            data: {
              name,
              address,
              phone,
              contactPerson,
              email,
              website: website || null,
              industry: industry || null,
              isActive
            }
          });

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`行${i + 2}: ${error instanceof Error ? error.message : '不明なエラー'}`);
        }
      }

      return NextResponse.json(results);
    } catch (error) {
      console.error('Import failed:', error);
      return NextResponse.json(
        { error: 'インポートに失敗しました' },
        { status: 500 }
      );
    }
  });
}