"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/layout/Navigation";
import { Calendar, Clock, Users, MapPin, FileText, AlertCircle } from "lucide-react";

export default function NewSchedulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    endTime: "",
    category: "meeting",
    location: "",
    attendees: "",
    description: "",
    priority: "medium",
    reminder: "15",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: APIに送信
    console.log("Form submitted:", formData);
    router.push("/schedules");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">新規スケジュール作成</h1>
            <p className="mt-1 text-sm text-gray-500">
              新しいスケジュールを作成してカレンダーに追加します
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">基本情報</h3>
            </div>
            
            <div className="px-6 py-5 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-2" />
                  タイトル
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="例：チームミーティング"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    日付
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-2" />
                    開始時間
                  </label>
                  <input
                    type="time"
                    name="time"
                    id="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-2" />
                    終了時間
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    id="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリー
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="meeting">ミーティング</option>
                    <option value="review">レビュー</option>
                    <option value="report">レポート</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    優先度
                  </label>
                  <select
                    name="priority"
                    id="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    場所
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="例：会議室A、オンライン"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline w-4 h-4 mr-2" />
                    参加者数
                  </label>
                  <input
                    type="number"
                    name="attendees"
                    id="attendees"
                    min="1"
                    value={formData.attendees}
                    onChange={handleChange}
                    placeholder="例：5"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="スケジュールの詳細を入力してください"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="reminder" className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertCircle className="inline w-4 h-4 mr-2" />
                  リマインダー
                </label>
                <select
                  name="reminder"
                  id="reminder"
                  value={formData.reminder}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="0">なし</option>
                  <option value="5">5分前</option>
                  <option value="15">15分前</option>
                  <option value="30">30分前</option>
                  <option value="60">1時間前</option>
                  <option value="1440">1日前</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 mr-1" />
                すべての必須項目を入力してください
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push("/schedules")}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  作成
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      </main>
    </div>
  );
}