#!/usr/bin/env node

// 包括的セキュリティテストスクリプト
const http = require('http');

const API_BASE = 'http://localhost:3001/api';

async function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 3001,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runSecurityTests() {
  console.log('🔐 Starting Comprehensive Security Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    vulnerabilities: [],
  };

  // テストケース定義
  const testCategories = [
    {
      name: '認証テスト',
      tests: [
        {
          name: '認証なしアクセス - 全APIエンドポイント',
          endpoints: [
            '/api/employees', '/api/customers', '/api/vehicles', '/api/schedules', '/api/tasks', '/api/vehicle-usages'
          ],
          shouldFail: true,
          headers: {},
        },
        {
          name: '無効なユーザーIDでのアクセス',
          endpoints: ['/api/employees'],
          shouldFail: true,
          headers: { 'x-user-id': 'invalid_user_123' },
        },
      ]
    },
    {
      name: '認可テスト（ロールベース）',
      tests: [
        {
          name: '一般ユーザー - 管理者専用操作の拒否',
          endpoint: '/api/employees',
          method: 'POST',
          shouldFail: true,
          headers: { 'x-user-id': 'emp_2' }, // general role
          data: {
            employeeNumber: 'SEC001',
            name: 'セキュリティ テスト',
            nameKana: 'セキュリティ テスト',
            email: 'security@test.com',
            phone: '090-1111-1111',
            nearestStation: '新宿駅',
            department: 'テスト部',
          },
        },
        {
          name: '管理者 - 権限内操作の許可',
          endpoint: '/api/employees',
          method: 'POST',
          shouldFail: false,
          headers: { 'x-user-id': 'emp_1' }, // admin role
          data: {
            employeeNumber: 'SEC002',
            name: 'セキュリティ 管理者',
            nameKana: 'セキュリティ カンリシャ',
            email: 'security-admin@test.com',
            phone: '090-2222-2222',
            nearestStation: '東京駅',
            department: 'テスト部',
          },
        },
      ]
    },
    {
      name: '[id]ルート認証テスト',
      tests: [
        {
          name: 'スケジュール[id]ルート - 認証なし',
          endpoint: '/api/schedules/sch_1',
          shouldFail: true,
          headers: {},
        },
        {
          name: '顧客[id]ルート - 認証なし',
          endpoint: '/api/customers/cust_1',
          shouldFail: true,
          headers: {},
        },
        {
          name: '車両[id]ルート - 認証なし',
          endpoint: '/api/vehicles/veh_1',
          shouldFail: true,
          headers: {},
        },
        {
          name: 'タスク[id]ルート - 認証なし',
          endpoint: '/api/tasks/task_1',
          shouldFail: true,
          headers: {},
        },
      ]
    },
    {
      name: 'データアクセス制御テスト',
      tests: [
        {
          name: '存在しないリソースへのアクセス',
          endpoint: '/api/schedules/nonexistent_123',
          shouldFail: true,
          headers: { 'x-user-id': 'emp_1' },
        },
        {
          name: 'SQLインジェクション攻撃テスト',
          endpoint: '/api/schedules',
          method: 'GET',
          query: '?startDate=2024-01-01\' OR 1=1--',
          shouldFail: false, // 適切にサニタイズされていれば通常のレスポンス
          headers: { 'x-user-id': 'emp_1' },
        },
      ]
    },
    {
      name: '権限昇格テスト',
      tests: [
        {
          name: '一般ユーザーによる管理者データアクセス試行',
          endpoint: '/api/employees/emp_1', // 管理者ユーザー
          shouldFail: false, // 基本情報のみ表示される
          headers: { 'x-user-id': 'emp_2' }, // 一般ユーザー
        },
      ]
    }
  ];

  // テスト実行
  for (const category of testCategories) {
    console.log(`\n📂 ${category.name}`);
    
    for (const test of category.tests) {
      if (test.endpoints) {
        // 複数エンドポイントのテスト
        for (const endpoint of test.endpoints) {
          await runSingleTest(test, endpoint, results);
        }
      } else {
        // 単一エンドポイントのテスト
        await runSingleTest(test, test.endpoint, results);
      }
    }
  }

  // セキュリティスキャン結果
  console.log('\n' + '='.repeat(60));
  console.log('📊 Security Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`🔒 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.vulnerabilities.length > 0) {
    console.log('\n🚨 Security Vulnerabilities Found:');
    results.vulnerabilities.forEach((vuln, index) => {
      console.log(`${index + 1}. ${vuln}`);
    });
  } else {
    console.log('\n✅ No critical security vulnerabilities detected!');
  }

  return results;
}

async function runSingleTest(test, endpoint, results) {
  try {
    console.log(`🧪 Testing: ${test.name} - ${endpoint}`);
    
    const path = endpoint + (test.query || '');
    const result = await makeRequest(
      path,
      test.method || 'GET',
      test.data,
      test.headers
    );
    
    const isSuccessful = result.status === 200 || result.status === 201;
    const testPassed = test.shouldFail ? !isSuccessful : isSuccessful;
    
    if (testPassed) {
      console.log(`✅ PASS: ${test.name} - ${endpoint}`);
      if (test.shouldFail) {
        console.log(`   → 正常にアクセス拒否: ${result.data.error || 'エラー'}`);
      } else {
        console.log(`   → 正常にアクセス許可`);
      }
      results.passed++;
    } else {
      console.log(`❌ FAIL: ${test.name} - ${endpoint}`);
      console.log(`   → 予期しない結果: Status ${result.status}`);
      console.log(`   → Response: ${result.data.error || result.data.message || 'No message'}`);
      
      // セキュリティ脆弱性として記録
      if (test.shouldFail && isSuccessful) {
        results.vulnerabilities.push(
          `Unauthorized access allowed: ${test.method || 'GET'} ${endpoint}`
        );
      }
      
      results.failed++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${test.name} - ${endpoint}: ${error.message}`);
    results.failed++;
  }
}

// サーバーの動作確認
makeRequest('/api/schedules', 'GET', null, { 'x-user-id': 'emp_1' })
  .then(() => {
    runSecurityTests()
      .then((results) => {
        const exitCode = results.vulnerabilities.length > 0 ? 1 : 0;
        process.exit(exitCode);
      });
  })
  .catch(() => {
    console.error('❌ Server is not running on localhost:3001');
    console.log('Please start the development server with: npm run dev');
    process.exit(1);
  });