import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  validateRequestBody,
  validateEntityExists,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { withAuth, checkEntityOwnership, isAdmin } from '@/lib/auth-utils';

// バリデーションスキーマ
const updateTaskSchema = z.object({
  title: z.string().min(1, 'タスク名は必須です').optional(),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  dueDate: z.string().min(1, '期限日は必須です').optional(),
  progress: z.number().int().min(0).max(100).optional(),
  assignedTo: z.string().optional(),
  scheduleId: z.string().nullable().optional(),
});

// GET /api/tasks/[id] - タスク詳細取得
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        schedule: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        activityLogs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!task) {
      return createErrorResponse(
        'タスクが見つかりません',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse(task);
  });
});

// PUT /api/tasks/[id] - タスク更新
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // 既存のタスクを確認
    const existingTask = await validateEntityExists(
      await prisma.task.findUnique({
        where: { id: params.id },
      }),
      'タスク'
    );

    // 担当者の存在確認（変更される場合）
    if (validatedData.assignedTo) {
      const assignee = await prisma.employee.findUnique({
        where: { id: validatedData.assignedTo },
      });

      if (!assignee) {
        return createErrorResponse(
          '指定された担当者が見つかりません',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // スケジュールの存在確認（変更される場合）
    if (validatedData.scheduleId !== undefined && validatedData.scheduleId !== null) {
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

    // トランザクションで更新
    const result = await prisma.$transaction(async (tx) => {
      // タスク更新
      const updatedTask = await tx.task.update({
        where: { id: params.id },
        data: validatedData,
      });

      // ステータス変更の特別な活動ログ
      if (validatedData.status && validatedData.status !== existingTask.status) {
        let action = 'update';
        let description = `タスク「${updatedTask.title}」のステータスを「${validatedData.status}」に更新しました`;
        
        if (validatedData.status === 'completed') {
          action = 'complete';
          description = `タスク「${updatedTask.title}」を完了しました`;
        } else if (validatedData.status === 'cancelled') {
          action = 'cancel';
          description = `タスク「${updatedTask.title}」をキャンセルしました`;
        }

        await tx.activityLog.create({
          data: {
            action,
            entityType: 'task',
            entityId: updatedTask.id,
            entityName: updatedTask.title,
            description,
            userId: existingTask.createdBy, // TODO: 実際の更新者IDを使用
          },
        });
      } else {
        // 通常の更新ログ
        await tx.activityLog.create({
          data: {
            action: 'update',
            entityType: 'task',
            entityId: updatedTask.id,
            entityName: updatedTask.title,
            description: `タスク「${updatedTask.title}」を更新しました`,
            userId: existingTask.createdBy, // TODO: 実際の更新者IDを使用
          },
        });
      }

      return updatedTask;
    });

    // 更新されたタスクを関連データと一緒に取得
    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
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
      updatedTask,
      'タスクが更新されました'
    );

  });
});

// DELETE /api/tasks/[id] - タスク削除
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return withAuth(request, async (request, user) => {
    // 既存のタスクを確認
    const existingTask = await validateEntityExists(
      await prisma.task.findUnique({
        where: { id: params.id },
      }),
      'タスク'
    );

    // トランザクションで削除
    await prisma.$transaction(async (tx) => {
      // 削除の活動ログ記録（削除前に記録）
      await tx.activityLog.create({
        data: {
          action: 'delete',
          entityType: 'task',
          entityId: params.id,
          entityName: existingTask.title,
          description: `タスク「${existingTask.title}」を削除しました`,
          userId: existingTask.createdBy, // TODO: 実際の削除者IDを使用
        },
      });

      // タスク削除
      await tx.task.delete({
        where: { id: params.id },
      });
    });

    return createSuccessResponse(
      null,
      'タスクが削除されました'
    );

  });
});