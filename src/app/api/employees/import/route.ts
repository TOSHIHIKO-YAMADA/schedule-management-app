import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CSV行をパースする関数
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // エスケープされた引用符
        current += '"';
        i++; // 次の引用符をスキップ
      } else {
        // 引用符の開始または終了
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // フィールドの区切り
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// POST /api/employees/import - CSVファイルから従業員データをインポート
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'CSVファイルを選択してください' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSVファイルにデータがありません' },
        { status: 400 }
      );
    }

    // ヘッダー行をスキップ
    const dataLines = lines.slice(1);
    const employees = [];
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const fields = parseCSVLine(dataLines[i]);
        
        if (fields.length < 11) { // IDフィールドは必須ではないため、11フィールド以上あればOK
          errors.push(`行 ${i + 2}: 必要なフィールドが不足しています`);
          continue;
        }

        // 通知方法のマッピング
        const notificationMethodMap: Record<string, string> = {
          'メール': 'email',
          'LINE': 'line',
          'メール・LINE': 'both',
          'email': 'email',
          'line': 'line',
          'both': 'both'
        };

        // 通勤手段のマッピング
        const transportationMap: Record<string, string> = {
          '電車': 'train',
          '車': 'car',
          '自転車': 'bicycle',
          '徒歩': 'walk',
          'バス': 'bus',
          'train': 'train',
          'car': 'car',
          'bicycle': 'bicycle',
          'walk': 'walk',
          'bus': 'bus'
        };

        // ステータスのマッピング
        const statusMap: Record<string, string> = {
          'アクティブ': 'ACTIVE',
          '非アクティブ': 'INACTIVE',
          'ACTIVE': 'ACTIVE',
          'INACTIVE': 'INACTIVE'
        };

        // IDフィールドは自動生成するためスキップ（fields[0]は無視）
        const name = fields[1].replace(/^"(.+)"$/, '$1').trim();
        const nameKana = fields[2].replace(/^"(.+)"$/, '$1').trim();
        const email = fields[3].trim();
        const phone = fields[4].trim() || null;
        const lineId = fields[5].trim() || null;
        const notificationMethod = notificationMethodMap[fields[6].trim()] || 'email';
        const department = fields[7].replace(/^"(.+)"$/, '$1').trim();
        const nearestStation = fields[8].replace(/^"(.+)"$/, '$1').trim();
        
        // フィールド数に応じて柔軟に対応
        const transportation = fields.length > 9 ? (transportationMap[fields[9].trim()] || 'train') : 'train';
        const status = fields.length > 10 ? (statusMap[fields[10].trim()] || 'ACTIVE') : 'ACTIVE';

        // バリデーション
        if (!name || !nameKana || !email || !department || !nearestStation) {
          errors.push(`行 ${i + 2}: 必須フィールドが入力されていません`);
          continue;
        }

        // メールアドレスの形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`行 ${i + 2}: メールアドレスの形式が正しくありません`);
          continue;
        }

        employees.push({
          name,
          nameKana,
          email,
          phone,
          lineId,
          notificationMethod,
          department,
          nearestStation,
          transportation,
          status
        });

      } catch (error) {
        errors.push(`行 ${i + 2}: データの解析に失敗しました`);
      }
    }

    if (errors.length > 0 && employees.length === 0) {
      return NextResponse.json(
        { 
          error: 'インポートできるデータがありません',
          errors: errors.slice(0, 10) // 最初の10個のエラーのみ表示
        },
        { status: 400 }
      );
    }

    // 重複メールアドレスのチェック
    const emails = employees.map(emp => emp.email);
    const existingEmployees = await prisma.employee.findMany({
      where: {
        email: {
          in: emails
        }
      },
      select: {
        email: true
      }
    });

    const existingEmails = new Set(existingEmployees.map(emp => emp.email));
    const newEmployees = employees.filter(emp => !existingEmails.has(emp.email));
    const duplicateEmails = employees.filter(emp => existingEmails.has(emp.email));

    if (newEmployees.length === 0) {
      return NextResponse.json(
        { 
          error: 'すべてのデータが既存のメールアドレスと重複しています',
          duplicates: duplicateEmails.length
        },
        { status: 400 }
      );
    }

    // データベースに挿入
    const result = await prisma.employee.createMany({
      data: newEmployees
    });

    return NextResponse.json({
      message: `${result.count}件の従業員データをインポートしました`,
      imported: result.count,
      duplicates: duplicateEmails.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to import employees:', error);
    return NextResponse.json(
      { error: 'インポート処理に失敗しました' },
      { status: 500 }
    );
  }
}