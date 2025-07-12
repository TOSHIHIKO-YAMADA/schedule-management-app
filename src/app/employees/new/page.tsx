"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

export default function NewEmployeePage() {
  const router = useRouter();

  const handleSuccess = (data?: any) => {
    if (data && data.id) {
      // 作成された従業員の詳細画面（編集モード）に遷移
      router.push(`/employees/${data.id}?edit=true`);
    } else {
      // データがない場合は一覧に戻る
      router.push("/employees");
    }
  };

  const handleCancel = () => {
    router.push("/employees");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">新規従業員登録</h1>
            <p className="text-lg text-gray-600">
              新しいメンバーの情報を入力して、チームに追加しましょう
            </p>
          </div>

          {/* プログレス表示 */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">基本情報入力</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">確認・保存</span>
              </div>
            </div>
          </div>

          {/* フォームカード */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden">
            <div className="p-8">
              <EmployeeForm 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}