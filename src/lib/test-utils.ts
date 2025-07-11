// テスト用ユーティリティ関数

export interface TestApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

// APIエンドポイントテスト用ヘルパー
export class ApiTestHelper {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<TestApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString());
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<TestApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<TestApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<TestApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  }
}

// テストデータファクトリー
export const TestDataFactory = {
  employee: (overrides?: Partial<any>) => ({
    employeeNumber: `EMP${Date.now()}`,
    name: 'テスト 太郎',
    nameKana: 'テスト タロウ',
    email: `test${Date.now()}@example.com`,
    phone: '090-1234-5678',
    notificationMethod: 'email' as const,
    nearestStation: 'テスト駅',
    transportation: 'train' as const,
    role: 'general' as const,
    department: 'テスト部',
    ...overrides,
  }),

  customer: (overrides?: Partial<any>) => ({
    name: `テスト株式会社${Date.now()}`,
    address: 'テスト県テスト市テスト町1-1-1',
    phone: '03-1234-5678',
    contactPerson: 'テスト 担当者',
    email: `customer${Date.now()}@test.co.jp`,
    website: 'https://test.co.jp',
    industry: 'IT',
    ...overrides,
  }),

  vehicle: (overrides?: Partial<any>) => ({
    name: `テスト車両${Date.now()}`,
    licensePlate: `品川500て${Date.now().toString().slice(-4)}`,
    inspectionDate: '2025-12-31',
    type: 'sedan' as const,
    capacity: 5,
    fuelType: 'hybrid' as const,
    ...overrides,
  }),

  task: (overrides?: Partial<any>) => ({
    title: `テストタスク${Date.now()}`,
    description: 'テスト用のタスクです',
    priority: 'medium' as const,
    status: 'pending' as const,
    dueDate: '2025-01-31',
    progress: 0,
    assignedTo: 'emp_1', // 既存の従業員ID
    createdBy: 'emp_1',
    ...overrides,
  }),

  vehicleUsage: (overrides?: Partial<any>) => ({
    startDateTime: '2025-01-20T09:00:00',
    endDateTime: '2025-01-20T17:00:00',
    purpose: 'テスト用途',
    mileageStart: 10000,
    mileageEnd: 10100,
    vehicleId: 'veh_1', // 既存の車両ID
    employeeId: 'emp_1', // 既存の従業員ID
    scheduleId: 'sch_1', // 既存のスケジュールID
    ...overrides,
  }),
};

// アサーション関数
export const assert = {
  isSuccessResponse<T>(response: TestApiResponse<T>): asserts response is TestApiResponse<T> & { success: true } {
    if (!response.success) {
      throw new Error(`Expected success response, got: ${JSON.stringify(response)}`);
    }
  },

  isErrorResponse<T>(response: TestApiResponse<T>): asserts response is TestApiResponse<T> & { success: false } {
    if (response.success) {
      throw new Error(`Expected error response, got: ${JSON.stringify(response)}`);
    }
  },

  hasData<T>(response: TestApiResponse<T>): asserts response is TestApiResponse<T> & { data: T } {
    if (response.data === undefined) {
      throw new Error(`Expected response to have data, got: ${JSON.stringify(response)}`);
    }
  },

  hasMessage(response: TestApiResponse): asserts response is TestApiResponse & { message: string } {
    if (!response.message) {
      throw new Error(`Expected response to have message, got: ${JSON.stringify(response)}`);
    }
  },

  isArray<T>(data: T): asserts data is T & any[] {
    if (!Array.isArray(data)) {
      throw new Error(`Expected data to be array, got: ${typeof data}`);
    }
  },
};

// テスト実行関数
export async function runApiTests() {
  const api = new ApiTestHelper();
  let passedTests = 0;
  let failedTests = 0;

  const test = async (name: string, testFn: () => Promise<void>) => {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      await testFn();
      console.log(`✅ PASS: ${name}`);
      passedTests++;
    } catch (error) {
      console.error(`❌ FAIL: ${name}`);
      console.error(error);
      failedTests++;
    }
  };

  console.log('🚀 Starting API Tests...\n');

  // 従業員API テスト
  await test('GET /api/employees', async () => {
    const response = await api.get('/employees');
    assert.isSuccessResponse(response);
    assert.hasData(response);
    assert.isArray(response.data);
  });

  // 顧客API テスト
  await test('GET /api/customers', async () => {
    const response = await api.get('/customers');
    assert.isSuccessResponse(response);
    assert.hasData(response);
    assert.isArray(response.data);
  });

  // 車両API テスト
  await test('GET /api/vehicles', async () => {
    const response = await api.get('/vehicles');
    assert.isSuccessResponse(response);
    assert.hasData(response);
    assert.isArray(response.data);
  });

  // タスクAPI テスト
  await test('GET /api/tasks', async () => {
    const response = await api.get('/tasks');
    assert.isSuccessResponse(response);
    assert.hasData(response);
    assert.isArray(response.data);
  });

  // 車両使用履歴API テスト
  await test('GET /api/vehicle-usages', async () => {
    const response = await api.get('/vehicle-usages');
    assert.isSuccessResponse(response);
    assert.hasData(response);
    assert.isArray(response.data);
  });

  // スケジュールAPI テスト
  await test('GET /api/schedules', async () => {
    const response = await api.get('/schedules');
    assert.isSuccessResponse(response);
    assert.hasData(response);
    assert.isArray(response.data);
  });

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  return { passedTests, failedTests };
}