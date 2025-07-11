"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createEmployeeSchema, 
  updateEmployeeSchema,
  CreateEmployeeInput,
  UpdateEmployeeInput 
} from "@/lib/validations/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { Employee } from "@prisma/client";

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!employee;

  const form = useForm<CreateEmployeeInput | UpdateEmployeeInput>({
    resolver: zodResolver(isEdit ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: employee ? {
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      department: employee.department,
      position: employee.position,
      status: employee.status,
    } : {
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      status: "ACTIVE",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const response = await apiClient.post('/employees', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      form.reset();
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateEmployeeInput) => {
      const response = await apiClient.put(`/employees/${employee!.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employee!.id] });
      onSuccess?.();
    },
  });

  const onSubmit = async (data: CreateEmployeeInput | UpdateEmployeeInput) => {
    if (isEdit) {
      updateMutation.mutate(data as UpdateEmployeeInput);
    } else {
      createMutation.mutate(data as CreateEmployeeInput);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>従業員名</FormLabel>
              <FormControl>
                <Input placeholder="従業員名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="example@company.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormControl>
                <Input placeholder="090-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>部署</FormLabel>
              <FormControl>
                <Input placeholder="開発部" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>役職</FormLabel>
              <FormControl>
                <Input placeholder="エンジニア" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ステータス</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">アクティブ</SelectItem>
                  <SelectItem value="INACTIVE">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEdit ? "更新中..." : "作成中...") : (isEdit ? "更新" : "作成")}
          </Button>
        </div>
      </form>
    </Form>
  );
}