import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ダミーデータ生成用の配列
const firstNames = [
  { name: '太郎', kana: 'たろう' }, { name: '花子', kana: 'はなこ' }, { name: '次郎', kana: 'じろう' },
  { name: '美咲', kana: 'みさき' }, { name: '三郎', kana: 'さぶろう' }, { name: '愛子', kana: 'あいこ' },
  { name: '健太', kana: 'けんた' }, { name: '由美', kana: 'ゆみ' }, { name: '大輔', kana: 'だいすけ' },
  { name: '真理', kana: 'まり' }, { name: '優介', kana: 'ゆうすけ' }, { name: '恵子', kana: 'けいこ' },
  { name: '浩二', kana: 'こうじ' }, { name: '智子', kana: 'ともこ' }, { name: '和也', kana: 'かずや' },
  { name: '麻衣', kana: 'まい' }, { name: '拓也', kana: 'たくや' }, { name: '綾子', kana: 'あやこ' },
  { name: '俊介', kana: 'しゅんすけ' }, { name: '香織', kana: 'かおり' }, { name: '直人', kana: 'なおと' },
  { name: '裕子', kana: 'ゆうこ' }, { name: '雅人', kana: 'まさと' }, { name: '京子', kana: 'きょうこ' },
  { name: '翔太', kana: 'しょうた' }, { name: '奈美', kana: 'なみ' }, { name: '慎一', kana: 'しんいち' },
  { name: '美穂', kana: 'みほ' }, { name: '達也', kana: 'たつや' }, { name: '佳子', kana: 'よしこ' }
];

const lastNames = [
  { name: '田中', kana: 'たなか' }, { name: '山田', kana: 'やまだ' }, { name: '佐藤', kana: 'さとう' },
  { name: '中村', kana: 'なかむら' }, { name: '小林', kana: 'こばやし' }, { name: '加藤', kana: 'かとう' },
  { name: '吉田', kana: 'よしだ' }, { name: '山本', kana: 'やまもと' }, { name: '佐々木', kana: 'ささき' },
  { name: '高橋', kana: 'たかはし' }, { name: '渡辺', kana: 'わたなべ' }, { name: '伊藤', kana: 'いとう' },
  { name: '中島', kana: 'なかじま' }, { name: '小川', kana: 'おがわ' }, { name: '岡田', kana: 'おかだ' },
  { name: '近藤', kana: 'こんどう' }, { name: '水野', kana: 'みずの' }, { name: '安田', kana: 'やすだ' },
  { name: '藤田', kana: 'ふじた' }, { name: '松本', kana: 'まつもと' }, { name: '前田', kana: 'まえだ' },
  { name: '岩田', kana: 'いわた' }, { name: '竹内', kana: 'たけうち' }, { name: '森田', kana: 'もりた' },
  { name: '清水', kana: 'しみず' }, { name: '石川', kana: 'いしかわ' }, { name: '池田', kana: 'いけだ' },
  { name: '橋本', kana: 'はしもと' }, { name: '山口', kana: 'やまぐち' }, { name: '木村', kana: 'きむら' }
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

// 日本語名をローマ字に変換する関数
function toRomaji(kana: string): string {
  const kanaToRomaji: Record<string, string> = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
    'ー': '', // 長音記号は無視
    'っ': '', // 促音は無視（簡略化）
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo'
  };

  return kana.split('').map(char => kanaToRomaji[char] || char).join('');
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
      
      // ローマ字変換してメールアドレス作成
      const lastNameRomaji = toRomaji(lastName.kana);
      const firstNameRomaji = toRomaji(firstName.kana);
      const email = `${lastNameRomaji}.${firstNameRomaji}${i}@example.com`;
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