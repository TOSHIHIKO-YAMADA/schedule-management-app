import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/employees/export - 従業員データをCSV形式でエクスポート
export async function GET(request: NextRequest) {
  try {
    // すべての従業員データを取得
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

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
      '役職',
      '最寄り駅',
      '主な通勤手段',
      'ステータス',
      '作成日',
      '更新日'
    ];

    // CSVデータ作成
    const csvData = [
      headers.join(','),
      ...employees.map(employee => [
        employee.id,
        `"${employee.name}"`,
        `"${employee.nameKana}"`,
        employee.email,
        employee.phone || '',
        employee.lineId || '',
        employee.notificationMethod === 'email' ? 'メール' : 
        employee.notificationMethod === 'line' ? 'LINE' : 
        employee.notificationMethod === 'both' ? 'メール・LINE' : employee.notificationMethod,
        `"${employee.department}"`,
        `"${employee.position}"`,
        `"${employee.nearestStation}"`,
        employee.transportation === 'train' ? '電車' :
        employee.transportation === 'car' ? '車' :
        employee.transportation === 'bicycle' ? '自転車' :
        employee.transportation === 'walk' ? '徒歩' :
        employee.transportation === 'bus' ? 'バス' : employee.transportation,
        employee.status === 'ACTIVE' ? 'アクティブ' : '非アクティブ',
        new Date(employee.createdAt).toLocaleDateString('ja-JP'),
        new Date(employee.updatedAt).toLocaleDateString('ja-JP')
      ].join(','))
    ].join('\n');

    // UTF-8 BOM付きでCSVファイルを返す（Excel対応）
    const bom = '\uFEFF';
    const csvWithBom = bom + csvData;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="employees_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Failed to export employees:', error);
    return NextResponse.json(
      { error: 'Failed to export employee data' },
      { status: 500 }
    );
  }
}