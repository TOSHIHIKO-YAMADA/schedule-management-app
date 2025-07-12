// 詳細API単体テストスクリプト（Gemini推奨順序に従って）
const API_BASE = 'http://localhost:3000/api';

// テスト用データ
const testData = {
  employee: {
    employeeNumber: 'TEST001',
    name: 'テスト太郎',
    nameKana: 'テスト タロウ',
    email: 'test@example.com',
    phone: '090-1234-5678',
    nearestStation: '新宿駅',
    department: 'テスト部'
  },
  customer: {
    name: 'テスト株式会社',
    address: '東京都テスト区1-1-1',
    phone: '03-1234-5678',
    contactPerson: 'テスト次郎',
    email: 'contact@test.com'
  },
  vehicle: {
    name: 'テスト車両',
    licensePlate: 'テスト123あ4567',
    inspectionDate: '2025-12-31',
    type: 'sedan',
    capacity: 5,
    fuelType: 'gasoline'
  },
  schedule: {
    title: 'テストスケジュール',
    description: 'API単体テスト用スケジュール',
    startDate: '2025-01-20',
    endDate: '2025-01-20',
    startTime: '10:00',
    endTime: '12:00',
    category: 'meeting',
    priority: 'medium',
    location: 'テスト会議室'
  }
};

async function runDetailedAPITests() {
  console.log('🧪 詳細API単体テスト開始\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, message = '') {
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${name}${message ? ` - ${message}` : ''}`);
    results.tests.push({ name, passed, message });
    if (passed) results.passed++;
    else results.failed++;
  }

  // 1. 基本認証テスト
  console.log('1️⃣ 基本認証テスト');
  
  const endpoints = [
    { method: 'GET', path: '/schedules' },
    { method: 'POST', path: '/schedules' },
    { method: 'GET', path: '/employees' },
    { method: 'POST', path: '/employees' },
    { method: 'GET', path: '/customers' },
    { method: 'POST', path: '/customers' },
    { method: 'GET', path: '/vehicles' },
    { method: 'POST', path: '/vehicles' }
  ];

  for (const endpoint of endpoints) {
    try {
      const options = { method: endpoint.method };
      if (endpoint.method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(testData.schedule);
      }
      
      const response = await fetch(`${API_BASE}${endpoint.path}`, options);
      logTest(
        `${endpoint.method} ${endpoint.path}`,
        response.status === 401,
        `Status: ${response.status}`
      );
    } catch (error) {
      logTest(`${endpoint.method} ${endpoint.path}`, false, `エラー: ${error.message}`);
    }
  }

  // 2. 個別リソースアクセステスト
  console.log('\n2️⃣ 個別リソースアクセステスト（認証なし）');
  
  const individualEndpoints = [
    '/schedules/test-id',
    '/employees/test-id',
    '/customers/test-id',
    '/vehicles/test-id'
  ];

  for (const endpoint of individualEndpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      logTest(
        `GET ${endpoint}`,
        response.status === 401,
        `Status: ${response.status}`
      );
    } catch (error) {
      logTest(`GET ${endpoint}`, false, `エラー: ${error.message}`);
    }
  }

  // 3. HTTPメソッドテスト
  console.log('\n3️⃣ HTTPメソッド対応テスト');
  
  const methodTests = [
    { method: 'PUT', path: '/schedules/test-id' },
    { method: 'DELETE', path: '/schedules/test-id' },
    { method: 'PATCH', path: '/schedules/test-id' },
    { method: 'OPTIONS', path: '/schedules' }
  ];

  for (const test of methodTests) {
    try {
      const options = { method: test.method };
      if (['PUT', 'PATCH'].includes(test.method)) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ title: 'Updated Title' });
      }
      
      const response = await fetch(`${API_BASE}${test.path}`, options);
      const expectedStatuses = [401, 404, 405]; // 認証エラー、NotFound、Method Not Allowed
      logTest(
        `${test.method} ${test.path}`,
        expectedStatuses.includes(response.status),
        `Status: ${response.status}`
      );
    } catch (error) {
      logTest(`${test.method} ${test.path}`, false, `エラー: ${error.message}`);
    }
  }

  // 4. リクエストボディバリデーションテスト（認証なしでも400や401が期待される）
  console.log('\n4️⃣ バリデーションテスト');
  
  const validationTests = [
    {
      endpoint: '/schedules',
      data: {}, // 空のオブジェクト
      testName: 'スケジュール空データ'
    },
    {
      endpoint: '/schedules',
      data: { invalidField: 'test' }, // 無効なフィールド
      testName: 'スケジュール無効フィールド'
    },
    {
      endpoint: '/employees',
      data: { email: 'invalid-email' }, // 無効なメール
      testName: '従業員無効メール'
    }
  ];

  for (const test of validationTests) {
    try {
      const response = await fetch(`${API_BASE}${test.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      // 認証なしなので401が期待されるが、バリデーションエラーが先に来る場合もある
      const validStatuses = [400, 401];
      logTest(
        test.testName,
        validStatuses.includes(response.status),
        `Status: ${response.status}`
      );
    } catch (error) {
      logTest(test.testName, false, `エラー: ${error.message}`);
    }
  }

  // 5. 非JSON リクエストテスト
  console.log('\n5️⃣ Content-Type テスト');
  
  try {
    const response = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'invalid data'
    });
    
    logTest(
      'POST 非JSONデータ',
      [400, 401, 415].includes(response.status), // Bad Request, Unauthorized, Unsupported Media Type
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('POST 非JSONデータ', false, `エラー: ${error.message}`);
  }

  // 6. レスポンス形式テスト
  console.log('\n6️⃣ レスポンス形式テスト');
  
  try {
    const response = await fetch(`${API_BASE}/schedules`);
    const contentType = response.headers.get('content-type');
    
    logTest(
      'JSON Content-Type',
      contentType && contentType.includes('application/json'),
      `Content-Type: ${contentType}`
    );

    if (response.status === 401) {
      const body = await response.json();
      logTest(
        'エラーレスポンス構造',
        body && typeof body.error === 'string',
        `Body: ${JSON.stringify(body)}`
      );
    }
  } catch (error) {
    logTest('レスポンス形式', false, `エラー: ${error.message}`);
  }

  // 7. 大きなペイロードテスト
  console.log('\n7️⃣ 大きなペイロードテスト');
  
  try {
    const largeData = {
      title: 'x'.repeat(10000), // 10KB
      description: 'y'.repeat(100000) // 100KB
    };
    
    const response = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(largeData)
    });
    
    logTest(
      '大きなペイロード',
      [400, 401, 413].includes(response.status), // Bad Request, Unauthorized, Payload Too Large
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('大きなペイロード', false, `エラー: ${error.message}`);
  }

  // 結果サマリー
  console.log('\n📊 テスト結果サマリー');
  console.log(`✅ 成功: ${results.passed}`);
  console.log(`❌ 失敗: ${results.failed}`);
  console.log(`📈 成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ 失敗したテスト:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.message}`);
    });
  }

  console.log('\n🎯 API単体テスト完了！');
  console.log('\n📋 次のステップ（Gemini推奨順序）:');
  console.log('1. ✅ API単体テスト完了');
  console.log('2. ⏳ 認証フローの完全動作確認');
  console.log('3. ⏳ TanStack Query統合');
  
  return results;
}

// Node.js環境でのみ実行
if (typeof window === 'undefined') {
  runDetailedAPITests().catch(console.error);
}