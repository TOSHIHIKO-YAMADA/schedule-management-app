import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/employees/clear - 全従業員データを削除
export async function DELETE(request: NextRequest) {
  try {
    const deletedCount = await prisma.employee.deleteMany({});

    return NextResponse.json({
      message: `${deletedCount.count}件の従業員データを削除しました`,
      count: deletedCount.count
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to clear employees:', error);
    return NextResponse.json(
      { error: 'Failed to clear employee data' },
      { status: 500 }
    );
  }
}