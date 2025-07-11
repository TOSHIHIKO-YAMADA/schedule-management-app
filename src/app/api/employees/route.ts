import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  withErrorHandling,
  validateRequestBody,
  validateEntityExists,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-utils';

// バリデーションスキーマ
const createEmployeeSchema = z.object({
  employeeNumber: z.string().min(1, '従業員番号は必須です'),
  name: z.string().min(1, '氏名は必須です'),
  nameKana: z.string().min(1, 'フリガナは必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号は必須です'),
  lineId: z.string().optional(),
  notificationMethod: z.enum(['email', 'line', 'both']).default('email'),
  nearestStation: z.string().min(1, '最寄り駅は必須です'),
  transportation: z.enum(['train', 'car', 'bicycle', 'walk']).default('train'),
  role: z.enum(['super', 'admin', 'limited_admin', 'general']).default('general'),
  department: z.string().min(1, '部署は必須です'),
  isActive: z.boolean().default(true),
});

// GET /api/employees - 従業員一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    // クエリ条件の構築
    const where: any = {};
    
    if (department) {
      where.department = department;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        notificationSettings: true,
        _count: {
          select: {
            createdSchedules: true,
            assignedTasks: true,
            scheduleAttendees: true,
          },
        },
      },
      orderBy: {
        employeeNumber: 'asc',
      },
    });

    return createSuccessResponse(employees);
  });
});

// POST /api/employees - 従業員作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(createEmployeeSchema, body);

    // 従業員番号とメールアドレスの重複チェック
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeNumber: validatedData.employeeNumber },
          { email: validatedData.email },
        ],
      },
    });

    if (existingEmployee) {
      const field = existingEmployee.employeeNumber === validatedData.employeeNumber 
        ? '従業員番号' : 'メールアドレス';
      return createErrorResponse(
        `${field}が既に使用されています`,
        HTTP_STATUS.CONFLICT
      );
    }

    // トランザクションで従業員と通知設定を作成
    const result = await prisma.$transaction(async (tx) => {
      // 従業員作成
      const employee = await tx.employee.create({
        data: validatedData,
      });

      // デフォルト通知設定作成
      await tx.notificationSettings.create({
        data: {
          userId: employee.id,
          scheduleReminder: true,
          vehicleInspectionAlert: true,
          taskDeadlineAlert: true,
          emailNotifications: validatedData.notificationMethod !== 'line',
          lineNotifications: validatedData.notificationMethod !== 'email',
          reminderMinutes: 30,
        },
      });

      return employee;
    });

    // 作成された従業員を通知設定と一緒に取得
    const createdEmployee = await validateEntityExists(
      await prisma.employee.findUnique({
        where: { id: result.id },
        include: {
          notificationSettings: true,
        },
      }),
      '作成された従業員'
    );

    return createSuccessResponse(
      createdEmployee,
      '従業員が作成されました',
      HTTP_STATUS.CREATED
    );
  });
});