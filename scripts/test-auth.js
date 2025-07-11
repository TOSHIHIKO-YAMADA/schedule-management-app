#!/usr/bin/env node

// 権限管理機能のテストスクリプト
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

async function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
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

async function runAuthTests() {
  console.log('🔐 Starting Authorization Tests...\n');

  const tests = [
    {
      name: 'GET /api/employees - 認証なし',
      path: '/api/employees',
      shouldFail: true,
      headers: {},
    },
    {
      name: 'GET /api/employees - 一般ユーザー',
      path: '/api/employees',
      shouldFail: false,
      headers: { 'x-user-id': 'emp_2' }, // general role
    },
    {
      name: 'POST /api/employees - 一般ユーザー（権限なし）',
      path: '/api/employees',
      method: 'POST',
      shouldFail: true,
      headers: { 'x-user-id': 'emp_2' }, // general role
      data: {
        employeeNumber: 'TEST001',
        name: 'テスト ユーザー',
        nameKana: 'テスト ユーザー',
        email: 'test@example.com',
        phone: '090-1234-5678',
        nearestStation: '新宿駅',
        department: 'テスト部',
      },
    },
    {
      name: 'POST /api/employees - 管理者',
      path: '/api/employees',
      method: 'POST',
      shouldFail: false,
      headers: { 'x-user-id': 'emp_1' }, // admin role
      data: {
        employeeNumber: 'TEST002',
        name: 'テスト 管理者',
        nameKana: 'テスト カンリシャ',
        email: 'admin-test@example.com',
        phone: '090-1234-5679',
        nearestStation: '東京駅',
        department: 'テスト部',
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      const result = await makeRequest(
        test.path,
        test.method || 'GET',
        test.data,
        test.headers
      );
      
      const isSuccessful = result.status === 200 || result.status === 201;
      const testPassed = test.shouldFail ? !isSuccessful : isSuccessful;
      
      if (testPassed) {
        console.log(`✅ PASS: ${test.name}`);
        if (test.shouldFail) {
          console.log(`   → 期待通りアクセス拒否: ${result.data.error || 'エラー'}`);
        } else {
          console.log(`   → 正常にアクセス許可`);
        }
        passed++;
      } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   → 期待と異なる結果: Status ${result.status}, ${result.data.error || result.data.message || 'No message'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${test.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Authorization Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

// サーバーの動作確認
makeRequest('/api/schedules')
  .then(() => {
    runAuthTests();
  })
  .catch(() => {
    console.error('❌ Server is not running on localhost:3000');
    console.log('Please start the development server with: npm run dev');
    process.exit(1);
  });