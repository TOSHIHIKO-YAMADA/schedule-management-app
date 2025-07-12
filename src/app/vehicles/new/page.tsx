'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleForm } from '@/components/vehicles/VehicleForm';

export default function NewVehiclePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/vehicles');
  };

  const handleSuccess = () => {
    router.push('/vehicles');
  };

  const handleCancel = () => {
    router.push('/vehicles');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="bg-white/80 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              車両新規登録
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              新しい車両情報を登録できます
            </p>
          </div>

          {/* フォームカード */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl shadow-green-100/50 overflow-hidden">
            <div className="p-8">
              <VehicleForm 
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