import { NextRequest, NextResponse } from 'next/server';

// GET /api/employees/sample - インポート用サンプルCSVファイルをダウンロード
export async function GET(request: NextRequest) {
  try {
    // CSVヘッダー
    const headers = [
      'ID',
      '氏名',
      'ふりがな',
      'メールアドレス',
      '電話番号',
      'LINE ID',
      '通知方法',
      '所属',
      '最寄り駅',
      '主な通勤手段',
      'ステータス',
      '作成日',
      '更新日'
    ];

    // サンプルデータ（3行のサンプル）
    const sampleData = [
      [
        '', // ID（インポート時は自動生成されるため空でOK）
        '"田中太郎"',
        '"たなかたろう"',
        'tanaka.taro@example.com',
        '090-1234-5678',
        'tanaka_line123',
        'メール',
        '"開発部"',
        '"新宿駅"',
        '電車',
        'アクティブ',
        '', // 作成日（インポート時は自動生成）
        ''  // 更新日（インポート時は自動生成）
      ],
      [
        '',
        '"佐藤花子"',
        '"さとうはなこ"',
        'sato.hanako@example.com',
        '080-9876-5432',
        '',
        'LINE',
        '"営業部"',
        '"渋谷駅"',
        'バス',
        'アクティブ',
        '', // 作成日（インポート時は自動生成）
        ''  // 更新日（インポート時は自動生成）
      ],
      [
        '',
        '"山田次郎"',
        '"やまだじろう"',
        'yamada.jiro@example.com',
        '070-1111-2222',
        'yamada_line456',
        'メール・LINE',
        '"管理部"',
        '"池袋駅"',
        '車',
        '非アクティブ',
        '', // 作成日（インポート時は自動生成）
        ''  // 更新日（インポート時は自動生成）
      ]
    ];

    // CSVデータ作成
    const csvData = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');

    // UTF-8 BOM付きでCSVファイルを返す（Excel対応）
    const bom = '\uFEFF';
    const csvWithBom = bom + csvData;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="employee_import_sample.csv"'
      }
    });

  } catch (error) {
    console.error('Failed to generate sample CSV:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample file' },
      { status: 500 }
    );
  }
}