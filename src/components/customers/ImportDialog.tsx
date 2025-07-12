'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/customers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as ImportResult;
    },
    onSuccess: (data) => {
      setSelectedFile(null);
      onSuccess?.();
      
      // ダイアログを閉じる
      onOpenChange(false);
      
      // 結果メッセージを表示
      let message = `${data.success}件の顧客データをインポートしました`;
      if (data.failed > 0) {
        message += `\n（${data.failed}件の失敗がありました）`;
      }
      if (data.errors && data.errors.length > 0) {
        message += `\n\nエラー:\n${data.errors.slice(0, 5).join('\n')}`;
      }
      alert(message);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'インポートに失敗しました';
      const errors = error.response?.data?.errors;
      
      let message = errorMessage;
      if (errors && errors.length > 0) {
        message += `\n\nエラー詳細:\n${errors.join('\n')}`;
      }
      alert(message);
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('CSVファイルを選択してください');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            顧客データをインポート
          </DialogTitle>
          <DialogDescription>
            CSVファイルを選択して顧客データを一括で追加できます
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* ファイル選択エリア */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <p className="text-sm font-medium text-green-700">
                  ファイルが選択されました
                </p>
                <p className="text-xs text-gray-600">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  CSVファイルをドラッグ&ドロップ
                </p>
                <p className="text-xs text-gray-500">
                  またはクリックしてファイルを選択
                </p>
              </div>
            )}
          </div>

          {/* 注意事項 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">インポート時の注意事項:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>ID、作成日、更新日は自動生成されるため入力不要です</li>
                  <li>既存のメールアドレスと重複するデータはスキップされます</li>
                  <li>必須項目: 会社名、住所、電話番号、担当者名、メールアドレス</li>
                  <li>サンプルファイルを参考に正しい形式で作成してください</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => window.open('/api/customers/sample', '_blank')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            サンプルをダウンロード
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || importMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {importMutation.isPending ? 'インポート中...' : 'インポート'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}