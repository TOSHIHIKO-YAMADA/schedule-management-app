import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ダミーデータ生成用の配列
const firstNames = [
  { name: '太郎', kana: 'タロウ' }, { name: '花子', kana: 'ハナコ' }, { name: '次郎', kana: 'ジロウ' },
  { name: '美咲', kana: 'ミサキ' }, { name: '三郎', kana: 'サブロウ' }, { name: '愛子', kana: 'アイコ' },
  { name: '健太', kana: 'ケンタ' }, { name: '由美', kana: 'ユミ' }, { name: '大輔', kana: 'ダイスケ' },
  { name: '真理', kana: 'マリ' }, { name: '優介', kana: 'ユウスケ' }, { name: '恵子', kana: 'ケイコ' },
  { name: '浩二', kana: 'コウジ' }, { name: '智子', kana: 'トモコ' }, { name: '和也', kana: 'カズヤ' },
  { name: '麻衣', kana: 'マイ' }, { name: '拓也', kana: 'タクヤ' }, { name: '綾子', kana: 'アヤコ' },
  { name: '俊介', kana: 'シュンスケ' }, { name: '香織', kana: 'カオリ' }, { name: '直人', kana: 'ナオト' },
  { name: '裕子', kana: 'ユウコ' }, { name: '雅人', kana: 'マサト' }, { name: '京子', kana: 'キョウコ' },
  { name: '翔太', kana: 'ショウタ' }, { name: '奈美', kana: 'ナミ' }, { name: '慎一', kana: 'シンイチ' },
  { name: '美穂', kana: 'ミホ' }, { name: '達也', kana: 'タツヤ' }, { name: '佳子', kana: 'ヨシコ' }
];

const lastNames = [
  { name: '田中', kana: 'タナカ' }, { name: '山田', kana: 'ヤマダ' }, { name: '佐藤', kana: 'サトウ' },
  { name: '中村', kana: 'ナカムラ' }, { name: '小林', kana: 'コバヤシ' }, { name: '加藤', kana: 'カトウ' },
  { name: '吉田', kana: 'ヨシダ' }, { name: '山本', kana: 'ヤマモト' }, { name: '佐々木', kana: 'ササキ' },
  { name: '高橋', kana: 'タカハシ' }, { name: '渡辺', kana: 'ワタナベ' }, { name: '伊藤', kana: 'イトウ' },
  { name: '中島', kana: 'ナカジマ' }, { name: '小川', kana: 'オガワ' }, { name: '岡田', kana: 'オカダ' },
  { name: '近藤', kana: 'コンドウ' }, { name: '水野', kana: 'ミズノ' }, { name: '安田', kana: 'ヤスダ' },
  { name: '藤田', kana: 'フジタ' }, { name: '松本', kana: 'マツモト' }, { name: '前田', kana: 'マエダ' },
  { name: '岩田', kana: 'イワタ' }, { name: '竹内', kana: 'タケウチ' }, { name: '森田', kana: 'モリタ' },
  { name: '清水', kana: 'シミズ' }, { name: '石川', kana: 'イシカワ' }, { name: '池田', kana: 'イケダ' },
  { name: '橋本', kana: 'ハシモト' }, { name: '山口', kana: 'ヤマグチ' }, { name: '木村', kana: 'キムラ' }
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

const notificationMethods = ['email', 'line', 'both'];

const nearestStations = [
  '新宿駅', '渋谷駅', '池袋駅', '品川駅', '東京駅', '上野駅', '秋葉原駅', '有楽町駅',
  '銀座駅', '六本木駅', '恵比寿駅', '目黒駅', '大手町駅', '日本橋駅', '新橋駅',
  '浜松町駅', '田町駅', '高田馬場駅', '中野駅', '吉祥寺駅', '立川駅', '八王子駅',
  '町田駅', '横浜駅', '川崎駅', '大宮駅', '浦和駅', '千葉駅', '船橋駅', '柏駅'
];

const transportations = ['train', 'car', 'bicycle', 'walk', 'bus'];

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

// ランダムなLINE ID生成
function generateLineId(): string | null {
  // 70%の確率でLINE IDを持つ
  if (Math.random() > 0.7) return null;
  const prefix = getRandomElement(['line', 'id', 'user']);
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}_${suffix}`;
}

// POST /api/employees/seed - 100件のダミーデータを生成
export async function POST(request: NextRequest) {
  try {
    const employees = [];
    
    for (let i = 1; i <= 100; i++) {
      const lastName = getRandomElement(lastNames);
      const firstName = getRandomElement(firstNames);
      const name = `${lastName.name}${firstName.name}`;
      const nameKana = `${lastName.kana}${firstName.kana}`;
      const email = `${lastName.name.toLowerCase()}${firstName.name.toLowerCase()}${i}@example.com`;
      const phone = generatePhoneNumber();
      const lineId = generateLineId();
      const notificationMethod = getRandomElement(notificationMethods);
      const department = getRandomElement(departments);
      const position = getRandomElement(positions);
      const nearestStation = getRandomElement(nearestStations);
      const transportation = getRandomElement(transportations);
      const status = Math.random() > 0.1 ? 'ACTIVE' : 'INACTIVE'; // 90%がACTIVE
      
      employees.push({
        name,
        nameKana,
        email,
        phone,
        lineId,
        notificationMethod,
        department,
        position,
        nearestStation,
        transportation,
        status,
      });
    }

    // 既存データを削除してから挿入
    await prisma.employee.deleteMany({});
    
    // バッチ挿入
    const createdEmployees = await prisma.employee.createMany({
      data: employees,
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