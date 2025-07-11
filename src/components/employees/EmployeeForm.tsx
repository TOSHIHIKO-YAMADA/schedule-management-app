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
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!employee;

  const form = useForm<CreateEmployeeInput | UpdateEmployeeInput>({
    resolver: zodResolver(isEdit ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: employee ? {
      name: employee.name,
      nameKana: employee.nameKana,
      email: employee.email,
      phone: employee.phone || "",
      lineId: employee.lineId || "",
      notificationMethod: employee.notificationMethod,
      department: employee.department,
      nearestStation: employee.nearestStation,
      transportation: employee.transportation,
      status: employee.status,
    } : {
      name: "",
      nameKana: "",
      email: "",
      phone: "",
      lineId: "",
      notificationMethod: "email" as const,
      department: "",
      nearestStation: "",
      transportation: "train" as const,
      status: "ACTIVE" as const,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const response = await apiClient.post('/employees', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      form.reset();
      onSuccess?.(data); // 作成されたemployeeデータを渡す
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>氏名</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="従業員名を入力" 
                    inputMode="text"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nameKana"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ふりがな</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="フリガナを入力" 
                    inputMode="text"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  inputMode="email"
                  placeholder="example@company.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>電話番号（任意）</FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    inputMode="tel"
                    placeholder="090-1234-5678" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LINE ID（任意）</FormLabel>
                <FormControl>
                  <Input 
                    inputMode="text"
                    autoCapitalize="none"
                    placeholder="LINE IDを入力" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notificationMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>通知方法</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 shadow-sm">
                    <SelectValue placeholder="通知方法を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-2 border-gray-300 shadow-xl">
                  <SelectItem value="email" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">メール</SelectItem>
                  <SelectItem value="line" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">LINE</SelectItem>
                  <SelectItem value="both" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">メール・LINE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>所属</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="開発部" 
                    inputMode="text"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nearestStation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>最寄り駅</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="新宿駅" 
                    inputMode="text"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="transportation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>主な通勤手段</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 shadow-sm">
                    <SelectValue placeholder="通勤手段を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-2 border-gray-300 shadow-xl">
                  <SelectItem value="train" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">電車</SelectItem>
                  <SelectItem value="car" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">車</SelectItem>
                  <SelectItem value="bicycle" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">自転車</SelectItem>
                  <SelectItem value="walk" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">徒歩</SelectItem>
                  <SelectItem value="bus" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">バス</SelectItem>
                </SelectContent>
              </Select>
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