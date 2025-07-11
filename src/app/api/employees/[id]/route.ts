import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateEmployeeSchema } from '@/lib/validations/employee';
import { ZodError } from 'zod';

// GET /api/employees/[id] - 従業員詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: '従業員が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - 従業員更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = updateEmployeeSchema.parse(body);

    // 従業員の存在確認
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: '従業員が見つかりません' },
        { status: 404 }
      );
    }

    // メールアドレスの重複チェック（自分以外）
    if (validatedData.email) {
      const emailDuplicate = await prisma.employee.findFirst({
        where: {
          id: { not: params.id },
          email: validatedData.email,
        },
      });

      if (emailDuplicate) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に使用されています' },
          { status: 409 }
        );
      }
    }

    // 従業員情報を更新
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - 従業員削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 従業員の存在確認
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: '従業員が見つかりません' },
        { status: 404 }
      );
    }

    // 従業員を削除
    await prisma.employee.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: '従業員が削除されました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}