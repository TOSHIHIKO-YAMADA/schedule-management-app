import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ダミーデータ生成用の配列
const firstNames = [
  '太郎', '花子', '次郎', '美咲', '三郎', '愛子', '健太', '由美', '大輔', '真理',
  '優介', '恵子', '浩二', '智子', '和也', '麻衣', '拓也', '綾子', '俊介', '香織',
  '直人', '裕子', '雅人', '京子', '翔太', '奈美', '慎一', '美穂', '達也', '佳子'
];

const lastNames = [
  '田中', '山田', '佐藤', '中村', '小林', '加藤', '吉田', '山本', '佐々木', '高橋',
  '渡辺', '伊藤', '中島', '小川', '岡田', '近藤', '水野', '安田', '藤田', '松本',
  '前田', '岩田', '竹内', '森田', '清水', '石川', '池田', '橋本', '山口', '木村'
];

const departments = [
  '開発部', '営業部', '管理部', '企画部', '人事部', '経理部', '総務部', '品質保証部'
];

const positions = [
  'エンジニア', 'シニアエンジニア', 'リードエンジニア', '営業担当', '営業主任',
  '課長', '部長', 'マネージャー', 'アシスタント', 'スペシャリスト', 'アナリスト',
  '主任', '係長', 'チームリーダー', 'プロジェクトマネージャー'
];

const statuses = ['ACTIVE', 'INACTIVE'];

// ランダム選択関数
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ランダムな電話番号生成
function generatePhoneNumber(): string {
  const prefixes = ['090', '080', '070'];
  const prefix = getRandomElement(prefixes);
  const middle = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${middle}-${suffix}`;
}

// POST /api/employees/seed - 100件のダミーデータを生成
export async function POST(request: NextRequest) {
  try {
    const employees = [];
    
    for (let i = 1; i <= 100; i++) {
      const lastName = getRandomElement(lastNames);
      const firstName = getRandomElement(firstNames);
      const name = `${lastName}${firstName}`;
      const email = `${lastName.toLowerCase()}${firstName.toLowerCase()}${i}@example.com`;
      const phone = generatePhoneNumber();
      const department = getRandomElement(departments);
      const position = getRandomElement(positions);
      const status = Math.random() > 0.1 ? 'ACTIVE' : 'INACTIVE'; // 90%がACTIVE
      
      employees.push({
        name,
        email,
        phone,
        department,
        position,
        status,
      });
    }

    // バッチ挿入
    const createdEmployees = await prisma.employee.createMany({
      data: employees,
      skipDuplicates: true, // 重複するメールアドレスをスキップ
    });

    return NextResponse.json({
      message: `${createdEmployees.count}件の従業員データを作成しました`,
      count: createdEmployees.count
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to seed employees:', error);
    return NextResponse.json(
      { error: 'Failed to create seed data' },
      { status: 500 }
    );
  }
}