'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

interface ImportResult {
  total: number;
  success: number;
  errors: string[];
  preview: any[];
}

export function BulkImportDialog({ open, onClose, onImport }: BulkImportDialogProps) {
  const [csvData, setCsvData] = useState('');
  const [parseResult, setParseResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const sampleCsv = `2024-12-01,現場A,東京都渋谷区1-1-1,顧客A,09:00,17:00,2,作業内容,true
2024-12-01,現場A,東京都渋谷区1-1-1,顧客A,18:00,22:00,1,夜間作業,true
2024-12-02,現場B,東京都新宿区2-2-2,顧客B,10:00,16:00,3,定期点検,false`;

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const results: any[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const columns = line.split(',').map(col => col.trim());

      if (columns.length < 8) {
        errors.push(`行${lineNumber}: 必要な列数が不足しています（最低8列必要）`);
        return;
      }

      const [date, siteName, address, customer, startTime, endTime, requiredPersons, notes, isConfirmed] = columns;

      // 基本的なバリデーション
      if (!date || !siteName || !address || !customer || !startTime || !endTime) {
        errors.push(`行${lineNumber}: 必須項目が不足しています`);
        return;
      }

      // 日付形式チェック
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push(`行${lineNumber}: 日付形式が正しくありません（YYYY-MM-DD形式で入力してください）`);
        return;
      }

      // 時刻形式チェック
      if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
        errors.push(`行${lineNumber}: 時刻形式が正しくありません（HH:MM形式で入力してください）`);
        return;
      }

      // 必要人数チェック
      const persons = parseInt(requiredPersons);
      if (isNaN(persons) || persons < 1) {
        errors.push(`行${lineNumber}: 必要人数は1以上の数値で入力してください`);
        return;
      }

      results.push({
        date,
        siteName,
        address,
        customer,
        startTime,
        endTime,
        requiredPersons: persons,
        notes: notes || '',
        isConfirmed: isConfirmed === 'true',
        lineNumber,
      });
    });

    return { results, errors };
  };

  const handleProcess = () => {
    setIsProcessing(true);
    const { results, errors } = parseCSV(csvData);
    
    setParseResult({
      total: csvData.trim().split('\n').length,
      success: results.length,
      errors,
      preview: results.slice(0, 5), // 最初の5件をプレビュー
    });
    setIsProcessing(false);
  };

  const handleImport = () => {
    if (parseResult && parseResult.success > 0) {
      const { results } = parseCSV(csvData);
      onImport(results);
      onClose();
      setCsvData('');
      setParseResult(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target?.result as string);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              CSV/TXT一括登録
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* フォーマット説明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CSVフォーマット
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                以下の形式でデータを入力してください：
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block mb-3">
                日付,現場名,現場住所,顧客名,開始時刻,終了時刻,必要人数,備考,確定状態
              </code>
              <div className="text-xs text-gray-500">
                <p>• 日付: YYYY-MM-DD形式（例: 2024-12-01）</p>
                <p>• 時刻: HH:MM形式（例: 09:00）</p>
                <p>• 確定状態: true または false</p>
              </div>
            </CardContent>
          </Card>

          {/* ファイルアップロード */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              ファイルアップロード
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  CSVまたはTXTファイルをクリックして選択
                </p>
              </label>
            </div>
          </div>

          {/* 手動入力 */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              または直接入力
            </Label>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder={`サンプル:\n${sampleCsv}`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* 処理ボタン */}
          <div className="flex gap-3">
            <Button 
              onClick={handleProcess}
              disabled={!csvData.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? '処理中...' : 'データを確認'}
            </Button>
          </div>

          {/* 結果表示 */}
          {parseResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {parseResult.errors.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  )}
                  処理結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Badge variant="outline">総行数: {parseResult.total}</Badge>
                  <Badge className="bg-green-100 text-green-800">
                    成功: {parseResult.success}件
                  </Badge>
                  {parseResult.errors.length > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      エラー: {parseResult.errors.length}件
                    </Badge>
                  )}
                </div>

                {/* エラー一覧 */}
                {parseResult.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-800 mb-2">エラー一覧:</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {parseResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* プレビュー */}
                {parseResult.preview.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      プレビュー（最初の{parseResult.preview.length}件）:
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2">日付</th>
                            <th className="border p-2">現場名</th>
                            <th className="border p-2">住所</th>
                            <th className="border p-2">顧客</th>
                            <th className="border p-2">時間</th>
                            <th className="border p-2">人数</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.preview.map((item, index) => (
                            <tr key={index}>
                              <td className="border p-2">{item.date}</td>
                              <td className="border p-2">{item.siteName}</td>
                              <td className="border p-2">{item.address}</td>
                              <td className="border p-2">{item.customer}</td>
                              <td className="border p-2">{item.startTime} - {item.endTime}</td>
                              <td className="border p-2">{item.requiredPersons}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* インポートボタン */}
                {parseResult.success > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      onClick={handleImport}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {parseResult.success}件のスケジュールを登録
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}