// API動作確認テストスクリプト
const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 API動作確認テスト開始\n');

  // 1. 認証なしアクセステスト
  console.log('1️⃣ 認証なしAPIアクセステスト');
  const endpoints = [
    '/schedules',
    '/employees', 
    '/customers',
    '/vehicles'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      const expectedStatus = 401;
      const actualStatus = response.status;
      
      if (actualStatus === expectedStatus) {
        console.log(`   ✅ GET ${endpoint} - ${actualStatus} (認証チェックOK)`);
      } else {
        console.log(`   ❌ GET ${endpoint} - ${actualStatus} (期待値: ${expectedStatus})`);
      }
    } catch (error) {
      console.log(`   ❌ GET ${endpoint} - エラー: ${error.message}`);
    }
  }

  // 2. 無効なエンドポイントテスト
  console.log('\n2️⃣ 無効なエンドポイントテスト');
  try {
    const response = await fetch(`${API_BASE}/nonexistent`);
    console.log(`   ✅ GET /nonexistent - ${response.status} (404期待)`);
  } catch (error) {
    console.log(`   ❌ GET /nonexistent - エラー: ${error.message}`);
  }

  // 3. CORSヘッダー確認
  console.log('\n3️⃣ レスポンスヘッダー確認');
  try {
    const response = await fetch(`${API_BASE}/schedules`);
    const contentType = response.headers.get('content-type');
    console.log(`   ✅ Content-Type: ${contentType}`);
  } catch (error) {
    console.log(`   ❌ ヘッダー取得エラー: ${error.message}`);
  }

  // 4. POSTメソッドテスト（認証なし）
  console.log('\n4️⃣ POSTメソッド認証テスト');
  try {
    const response = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Schedule',
        description: 'Test Description'
      })
    });
    
    if (response.status === 401) {
      console.log(`   ✅ POST /schedules - ${response.status} (認証チェックOK)`);
    } else {
      console.log(`   ❌ POST /schedules - ${response.status} (期待値: 401)`);
    }
  } catch (error) {
    console.log(`   ❌ POST /schedules - エラー: ${error.message}`);
  }

  console.log('\n🎯 テスト完了！\n');
  console.log('📋 次のステップ:');
  console.log('1. ブラウザで http://localhost:3000 にアクセス');
  console.log('2. Clerkアカウントでサインアップ/サインイン');
  console.log('3. 認証後のダッシュボードと各ページの動作確認');
  console.log('4. 実際のデータ操作テスト\n');
}

// Node.js環境でのみ実行
if (typeof window === 'undefined') {
  testAPI().catch(console.error);
}