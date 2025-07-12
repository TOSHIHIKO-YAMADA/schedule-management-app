import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 データベースシード開始...');

  // 既存データのクリア
  await prisma.task.deleteMany();
  await prisma.scheduleAssignment.deleteMany();
  await prisma.scheduleTimeSlot.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.vehicleUsage.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vehicle.deleteMany();

  // 従業員データ作成
  const employees = await prisma.employee.createMany({
    data: [
      {
        id: 'emp_1',
        name: '田中 太郎',
        nameKana: 'タナカ タロウ',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        nearestStation: '新宿駅',
        transportation: 'train',
        role: 'admin',
        department: '営業部',
        position: '部長',
      },
      {
        id: 'emp_2',
        name: '佐藤 花子',
        nameKana: 'サトウ ハナコ',
        email: 'sato@example.com',
        phone: '090-2345-6789',
        nearestStation: '渋谷駅',
        transportation: 'train',
        role: 'general',
        department: '営業部',
        position: '主任',
      },
      {
        id: 'emp_3',
        name: '鈴木 次郎',
        nameKana: 'スズキ ジロウ',
        email: 'suzuki@example.com',
        phone: '090-3456-7890',
        nearestStation: '池袋駅',
        transportation: 'car',
        role: 'general',
        department: '技術部',
        position: 'エンジニア',
      },
      {
        id: 'emp_4',
        name: '高橋 美咲',
        nameKana: 'タカハシ ミサキ',
        email: 'takahashi@example.com',
        phone: '090-4567-8901',
        nearestStation: '品川駅',
        transportation: 'bicycle',
        role: 'limited_admin',
        department: '管理部',
        position: '課長',
      },
    ],
  });

  // 顧客データ作成
  const customers = await prisma.customer.createMany({
    data: [
      {
        id: 'cust_1',
        name: '株式会社サンプル商事',
        address: '東京都千代田区丸の内1-1-1',
        phone: '03-1234-5678',
        contactPerson: '山田 一郎',
        email: 'yamada@sample.co.jp',
        website: 'https://sample.co.jp',
        industry: '商社',
      },
      {
        id: 'cust_2',
        name: 'テスト株式会社',
        address: '東京都新宿区西新宿2-2-2',
        phone: '03-2345-6789',
        contactPerson: '伊藤 次郎',
        email: 'ito@test.co.jp',
        website: 'https://test.co.jp',
        industry: 'IT',
      },
      {
        id: 'cust_3',
        name: '株式会社デモンストレーション',
        address: '東京都港区六本木3-3-3',
        phone: '03-3456-7890',
        contactPerson: '加藤 三郎',
        email: 'kato@demo.co.jp',
        industry: 'コンサルティング',
      },
    ],
  });

  // 車両データ作成
  const vehicles = await prisma.vehicle.createMany({
    data: [
      {
        id: 'veh_1',
        name: 'プリウス1号車',
        licensePlate: '品川500あ1234',
        inspectionDate: new Date('2025-08-15'),
        model: 'プリウス',
        manufacturer: 'トヨタ',
        year: 2022,
        capacity: 5,
        fuelType: 'hybrid',
      },
      {
        id: 'veh_2',
        name: 'ハイエース',
        licensePlate: '品川400さ5678',
        inspectionDate: new Date('2025-11-20'),
        model: 'ハイエース',
        manufacturer: 'トヨタ',
        year: 2021,
        capacity: 8,
        fuelType: 'gasoline',
      },
      {
        id: 'veh_3',
        name: 'アクア2号車',
        licensePlate: '品川500か9012',
        inspectionDate: new Date('2025-06-30'),
        model: 'アクア',
        manufacturer: 'トヨタ',
        year: 2023,
        capacity: 5,
        fuelType: 'hybrid',
      },
    ],
  });

  // スケジュールデータ作成
  const schedules = await prisma.schedule.createMany({
    data: [
      {
        id: 'sch_1',
        title: 'サンプル商事様との営業会議',
        description: '新商品提案とQ1の売上報告について',
        startTime: new Date('2025-01-15T10:00:00'),
        endTime: new Date('2025-01-15T12:00:00'),
        type: 'meeting',
        location: '株式会社サンプル商事 会議室A',
        status: 'scheduled',
        employeeId: 'emp_1',
        customerId: 'cust_1',
        vehicleId: 'veh_1',
        createdBy: 'emp_1',
        reminderMinutes: 30,
      },
      {
        id: 'sch_2',
        title: 'システム保守作業',
        description: 'サーバーメンテナンスとセキュリティアップデート',
        startTime: new Date('2025-01-16T18:00:00'),
        endTime: new Date('2025-01-16T22:00:00'),
        type: 'maintenance',
        location: '本社データセンター',
        status: 'scheduled',
        employeeId: 'emp_3',
        createdBy: 'emp_3',
        reminderMinutes: 60,
      },
      {
        id: 'sch_3',
        title: 'テスト株式会社様システム導入',
        description: 'CRMシステムの導入支援と初期設定',
        startTime: new Date('2025-01-17T13:00:00'),
        endTime: new Date('2025-01-17T17:00:00'),
        type: 'fieldwork',
        location: 'テスト株式会社 本社',
        status: 'scheduled',
        employeeId: 'emp_2',
        customerId: 'cust_2',
        vehicleId: 'veh_2',
        createdBy: 'emp_2',
        reminderMinutes: 45,
      },
      {
        id: 'sch_4',
        title: '月次売上レポート作成',
        description: '12月度の売上実績まとめと分析',
        startTime: new Date('2025-01-20T09:00:00'),
        endTime: new Date('2025-01-20T11:00:00'),
        type: 'work',
        location: '本社',
        status: 'scheduled',
        employeeId: 'emp_4',
        createdBy: 'emp_4',
      },
    ],
  });

  // タスクデータ作成
  const tasks = await prisma.task.createMany({
    data: [
      {
        id: 'task_1',
        title: '提案資料作成',
        description: 'サンプル商事様向け新商品の提案資料を作成',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date('2025-01-15'),
        assignedTo: 'emp_1',
        customerId: 'cust_1',
        createdBy: 'emp_1',
      },
      {
        id: 'task_2',
        title: 'セキュリティパッチ適用',
        description: 'Webサーバーのセキュリティパッチを適用',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2025-01-16'),
        assignedTo: 'emp_3',
        createdBy: 'emp_3',
      },
      {
        id: 'task_3',
        title: 'CRM設定マニュアル作成',
        description: 'テスト株式会社様向けCRMの操作マニュアル作成',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2025-01-17'),
        assignedTo: 'emp_2',
        customerId: 'cust_2',
        createdBy: 'emp_2',
      },
      {
        id: 'task_4',
        title: 'データ集計',
        description: '12月度売上データの集計と整理',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date('2025-01-19'),
        assignedTo: 'emp_4',
        createdBy: 'emp_4',
        completedAt: new Date('2025-01-18T16:30:00'),
      },
    ],
  });

  console.log('✅ シードデータ作成完了!');
  console.log(`📊 作成されたデータ:`);
  console.log(`   - 従業員: 4件`);
  console.log(`   - 顧客: 3件`);
  console.log(`   - 車両: 3件`);
  console.log(`   - スケジュール: 4件`);
  console.log(`   - タスク: 4件`);
}

main()
  .catch((e) => {
    console.error('🚨 シード実行エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });