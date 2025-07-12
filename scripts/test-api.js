#!/usr/bin/env node

// Simple Node.js script to test API endpoints
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  const tests = [
    { name: 'GET /employees', path: '/employees' },
    { name: 'GET /customers', path: '/customers' },
    { name: 'GET /vehicles', path: '/vehicles' },
    { name: 'GET /tasks', path: '/tasks' },
    { name: 'GET /vehicle-usages', path: '/vehicle-usages' },
    { name: 'GET /schedules', path: '/schedules' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      const result = await makeRequest(test.path);
      
      if (result.status === 200 && result.data.success) {
        console.log(`✅ PASS: ${test.name} (${result.data.data?.length || 0} items)`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${test.name} - Status: ${result.status}, Error: ${result.data.error || 'Unknown'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${test.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

// Check if server is running
makeRequest('/employees')
  .then(() => {
    runTests();
  })
  .catch(() => {
    console.error('❌ Server is not running on localhost:3000');
    console.log('Please start the development server with: npm run dev');
    process.exit(1);
  });