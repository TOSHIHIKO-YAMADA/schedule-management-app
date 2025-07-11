import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  validateRequestBody,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-utils';

// バリデーションスキーマ
const createTaskSchema = z.object({
  title: z.string().min(1, 'タスク名は必須です'),
  description: z.string().default(''),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  dueDate: z.string().min(1, '期限日は必須です'),
  progress: z.number().int().min(0).max(100).default(0),
  assignedTo: z.string().min(1, '担当者は必須です'),
  scheduleId: z.string().optional(),
  createdBy: z.string().min(1, '作成者は必須です'),
});

// GET /api/tasks - タスク一覧取得
export const GET = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assignedTo');
    const scheduleId = searchParams.get('scheduleId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');

    // クエリ条件の構築
    const where: any = {};
    
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }
    
    if (scheduleId) {
      where.scheduleId = scheduleId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) {
        where.dueDate.gte = dueDateFrom;
      }
      if (dueDateTo) {
        where.dueDate.lte = dueDateTo;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'asc' },
        { dueDate: 'asc' },
      ],
    });

    return createSuccessResponse(tasks);
  });
});

// POST /api/tasks - タスク作成
export const POST = withErrorHandling(async (request: NextRequest) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = validateRequestBody(createTaskSchema, body);

    // 担当者の存在確認
    const assignee = await prisma.employee.findUnique({
      where: { id: validatedData.assignedTo },
    });

    if (!assignee) {
      return createErrorResponse(
        '指定された担当者が見つかりません',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // スケジュールの存在確認（指定された場合）
    if (validatedData.scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: validatedData.scheduleId },
      });

      if (!schedule) {
        return createErrorResponse(
          '指定されたスケジュールが見つかりません',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // トランザクションでタスクを作成
    const result = await prisma.$transaction(async (tx) => {
      // タスク作成
      const task = await tx.task.create({
        data: validatedData,
      });

      // 活動ログ記録
      await tx.activityLog.create({
        data: {
          action: 'create',
          entityType: 'task',
          entityId: task.id,
          entityName: task.title,
          description: `タスク「${task.title}」を作成しました`,
          userId: validatedData.createdBy,
        },
      });

      return task;
    });

    // 作成されたタスクを関連データと一緒に取得
    const createdTask = await prisma.task.findUnique({
      where: { id: result.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return createSuccessResponse(
      createdTask,
      'タスクが作成されました',
      HTTP_STATUS.CREATED
    );
  });
});