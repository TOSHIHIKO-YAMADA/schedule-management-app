import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ダミーデータ生成用の配列
const companyNames = [
  '株式会社サンプル', '有限会社テスト', '合同会社デモ', '株式会社エグザンプル',
  '株式会社モックアップ', '有限会社プロトタイプ', '株式会社ダミー', '合同会社サンプリング',
  '株式会社テストケース', '有限会社モデル', '株式会社シミュレート', '合同会社ベンチマーク',
  '株式会社アルファ', '有限会社ベータ', '株式会社ガンマ', '合同会社デルタ',
  '株式会社イプシロン', '有限会社ゼータ', '株式会社イータ', '合同会社シータ',
  '株式会社カッパ', '有限会社ラムダ', '株式会社ミュー', '合同会社ニュー',
  '株式会社オミクロン', '有限会社パイ', '株式会社ロー', '合同会社シグマ',
  '株式会社タウ', '有限会社ファイ', '株式会社カイ', '合同会社プサイ',
  '株式会社オメガ', '有限会社アクア', '株式会社ブルー', '合同会社グリーン',
  '株式会社レッド', '有限会社イエロー', '株式会社パープル', '合同会社オレンジ'
];

const industries = [
  '製造業', '小売業', 'サービス業', 'IT・通信', '医療・福祉', '建設業',
  '教育・学習支援業', '金融・保険業', '不動産業', '運輸・郵便業',
  '卸売業', '宿泊・飲食サービス業', '生活関連サービス業', '娯楽業',
  '学術研究・専門・技術サービス業', 'その他'
];

const contactNames = [
  '田中太郎', '山田花子', '佐藤次郎', '中村美咲', '小林三郎', '加藤愛子',
  '吉田健太', '山本由美', '佐々木大輔', '高橋真理', '渡辺優介', '伊藤恵子',
  '中島浩二', '小川智子', '岡田和也', '近藤麻衣', '水野拓也', '安田綾子',
  '藤田俊介', '松本香織', '前田直人', '岩田裕子', '竹内雅人', '森田京子',
  '清水翔太', '石川奈美', '池田慎一', '橋本美穂', '山口達也', '木村佳子'
];

const prefectures = [
  '東京都', '神奈川県', '千葉県', '埼玉県', '茨城県', '栃木県', '群馬県',
  '大阪府', '京都府', '兵庫県', '奈良県', '和歌山県', '滋賀県',
  '愛知県', '岐阜県', '三重県', '静岡県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県',
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'
];

// ランダム選択関数
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ランダムな電話番号生成
function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
  const exchange = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${areaCode.toString().padStart(2, '0')}-${exchange}-${number}`;
}

// ランダムなメールアドレス生成
function generateEmail(companyName: string, contactName: string, index: number): string {
  const domain = companyName
    .replace(/株式会社|有限会社|合同会社/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const contact = contactName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${contact}${index}@${domain}.co.jp`;
}

// ランダムなウェブサイトURL生成
function generateWebsite(companyName: string): string | null {
  // 70%の確率でウェブサイトを持つ
  if (Math.random() > 0.7) return null;
  const domain = companyName
    .replace(/株式会社|有限会社|合同会社/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `https://www.${domain}.co.jp`;
}

// ランダムな住所生成
function generateAddress(): string {
  const prefecture = getRandomElement(prefectures);
  const city = `${Math.floor(Math.random() * 50) + 1}市`;
  const district = `${Math.floor(Math.random() * 20) + 1}区`;
  const block = `${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 30) + 1}`;
  return `${prefecture}${city}${district}${block}`;
}

// POST /api/customers/seed - 100件のダミーデータを生成
export async function POST(request: NextRequest) {
  try {
    const customers = [];
    
    for (let i = 1; i <= 100; i++) {
      const companyName = getRandomElement(companyNames);
      const contactName = getRandomElement(contactNames);
      const industry = getRandomElement(industries);
      const address = generateAddress();
      const phone = generatePhoneNumber();
      const email = generateEmail(companyName, contactName, i);
      const website = generateWebsite(companyName);
      const isActive = Math.random() > 0.1; // 90%がアクティブ
      
      customers.push({
        name: `${companyName}${i}`,
        address,
        phone,
        contactPerson: contactName,
        email,
        website,
        industry,
        isActive,
      });
    }

    // 既存データを削除してから挿入
    await prisma.customer.deleteMany({});
    
    // バッチ挿入
    const createdCustomers = await prisma.customer.createMany({
      data: customers,
    });

    return NextResponse.json({
      success: true,
      message: `${createdCustomers.count}件の顧客データを作成しました`,
      count: createdCustomers.count
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to seed customers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create seed data'
    }, { status: 500 });
  }
}