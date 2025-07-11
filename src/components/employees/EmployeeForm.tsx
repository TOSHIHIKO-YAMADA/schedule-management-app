"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, MessageCircle, Building, MapPin, Train, Bell, Save, X, UserPlus } from 'lucide-react';
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 基本情報セクション */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gradient-to-r from-blue-200 to-indigo-200">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">基本情報</h3>
              <p className="text-sm text-gray-600">従業員の基本的な情報を入力してください</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    氏名 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="山田太郎" 
                      inputMode="text"
                      className="h-12 bg-gray-50/50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all duration-200 rounded-xl"
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
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    ふりがな <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="やまだたろう" 
                      inputMode="text"
                      className="h-12 bg-gray-50/50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all duration-200 rounded-xl"
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
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  所属 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="開発部" 
                    inputMode="text"
                    className="h-12 bg-gray-50/50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all duration-200 rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 連絡先情報セクション */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gradient-to-r from-green-200 to-blue-200">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">連絡先情報</h3>
              <p className="text-sm text-gray-600">メールアドレスや電話番号などの連絡先を入力してください</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  メールアドレス <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    inputMode="email"
                    placeholder="yamada.taro@company.com" 
                    className="h-12 bg-gray-50/50 border-2 border-gray-200 focus:border-green-500 focus:bg-white transition-all duration-200 rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    電話番号（任意）
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      inputMode="tel"
                      placeholder="090-1234-5678" 
                      className="h-12 bg-gray-50/50 border-2 border-gray-200 focus:border-green-500 focus:bg-white transition-all duration-200 rounded-xl"
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
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    LINE ID（任意）
                  </FormLabel>
                  <FormControl>
                    <Input 
                      inputMode="text"
                      autoCapitalize="none"
                      placeholder="yamada_taro" 
                      className="h-12 bg-gray-50/50 border-2 border-gray-200 focus:border-green-500 focus:bg-white transition-all duration-200 rounded-xl"
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
                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-green-600" />
                  通知方法 <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-gray-50/50 border-2 border-gray-200 hover:border-green-400 focus:border-green-500 shadow-sm rounded-xl">
                      <SelectValue placeholder="通知方法を選択してください" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-2 border-gray-300 shadow-xl rounded-xl">
                    <SelectItem value="email" className="hover:bg-green-50 focus:bg-green-100 cursor-pointer">メール</SelectItem>
                    <SelectItem value="line" className="hover:bg-green-50 focus:bg-green-100 cursor-pointer">LINE</SelectItem>
                    <SelectItem value="both" className="hover:bg-green-50 focus:bg-green-100 cursor-pointer">メール・LINE</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 勤務情報セクション */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gradient-to-r from-purple-200 to-pink-200">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">勤務情報</h3>
              <p className="text-sm text-gray-600">勤務先や通勤に関する情報を入力してください</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="nearestStation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  最寄り駅 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="新宿駅" 
                    inputMode="text"
                    className="h-12 bg-gray-50/50 border-2 border-gray-200 focus:border-purple-500 focus:bg-white transition-all duration-200 rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="transportation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Train className="w-4 h-4 text-purple-600" />
                    主な通勤手段 <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-gray-50/50 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 shadow-sm rounded-xl">
                        <SelectValue placeholder="通勤手段を選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-2 border-gray-300 shadow-xl rounded-xl">
                      <SelectItem value="train" className="hover:bg-purple-50 focus:bg-purple-100 cursor-pointer">電車</SelectItem>
                      <SelectItem value="car" className="hover:bg-purple-50 focus:bg-purple-100 cursor-pointer">車</SelectItem>
                      <SelectItem value="bicycle" className="hover:bg-purple-50 focus:bg-purple-100 cursor-pointer">自転車</SelectItem>
                      <SelectItem value="walk" className="hover:bg-purple-50 focus:bg-purple-100 cursor-pointer">徒歩</SelectItem>
                      <SelectItem value="bus" className="hover:bg-purple-50 focus:bg-purple-100 cursor-pointer">バス</SelectItem>
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
                  <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    ステータス <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-gray-50/50 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 shadow-sm rounded-xl">
                        <SelectValue placeholder="ステータスを選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-2 border-gray-300 shadow-xl rounded-xl">
                      <SelectItem value="ACTIVE" className="hover:bg-purple-50 focus:bg-purple-100 cursor-pointer">アクティブ</SelectItem>
                      <SelectItem value="INACTIVE" className="hover:bg-purple-50 focus:bg-purple-100 cursor-pointer">非アクティブ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="h-12 px-8 text-sm font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              キャンセル
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 px-8 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            {isEdit ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "更新中..." : "更新"}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                {isLoading ? "作成中..." : "作成"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}