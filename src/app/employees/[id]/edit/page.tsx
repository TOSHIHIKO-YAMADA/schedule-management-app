"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ApiErrorAlert } from "@/components/ui/ApiErrorAlert";
import { apiClient } from "@/lib/api-client";

interface EditEmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data;
    },
  });

  const handleSuccess = () => {
    router.push("/employees");
  };

  const handleCancel = () => {
    router.push("/employees");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ApiErrorAlert 
            error={error} 
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              従業員が見つかりません
            </h1>
            <p className="text-muted-foreground mb-4">
              指定された従業員は存在しないか、削除されている可能性があります。
            </p>
            <button 
              onClick={() => router.push("/employees")}
              className="text-primary hover:underline"
            >
              従業員一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">従業員情報編集</h1>
          <p className="text-muted-foreground mt-2">
            {employee.name}の情報を編集してください。
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <EmployeeForm 
            employee={employee}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}