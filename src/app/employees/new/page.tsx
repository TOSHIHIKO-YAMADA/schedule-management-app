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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">新規従業員登録</h1>
          <p className="text-muted-foreground mt-2">
            新しい従業員の情報を入力してください。
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <EmployeeForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}