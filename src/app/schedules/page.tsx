"use client";

import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { Calendar, List, Search, Plus, SlidersHorizontal, Download } from "lucide-react";
import Link from "next/link";
import { schedules, categorySettings } from "@/lib/mockData";
import { Schedule } from "@/lib/types";
import { ModernCalendar } from "@/components/calendar/ModernCalendar";
import { ModernListView } from "@/components/calendar/ModernListView";
import { PageTransition, FadeIn, SlideIn } from "@/components/animations/PageTransition";
import { InteractiveButton } from "@/components/animations/InteractiveCard";

export default function SchedulesPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || schedule.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventClick = (schedule: Schedule) => {
    console.log('Event clicked:', schedule);
  };

  const handleDateSelect = (start: Date, end: Date) => {
    console.log('Date selected:', start, end);
  };

  const handleEventChange = (scheduleId: string, newStart: Date, newEnd: Date) => {
    console.log('Event changed:', scheduleId, newStart, newEnd);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="px-4 py-6 sm:px-0">
            <FadeIn delay={0.1}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold gradient-text">スケジュール</h1>
                  <p className="text-muted-foreground mt-2">
                    チーム全体のスケジュールを管理・確認できます
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <InteractiveButton
                    variant="secondary"
                    className="border border-border"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    エクスポート
                  </InteractiveButton>
                  
                  <Link href="/schedules/new">
                    <InteractiveButton variant="primary">
                      <Plus className="w-4 h-4 mr-2" />
                      新規作成
                    </InteractiveButton>
                  </Link>
                </div>
              </div>
            </FadeIn>

            <SlideIn delay={0.2} direction="up">
              <div className="mb-8 bg-card rounded-3xl shadow-soft border border-border/50 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      placeholder="スケジュールやメンバーを検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="inline-flex items-center px-4 py-3 text-sm font-medium text-foreground bg-background hover:bg-secondary border border-border rounded-xl transition-all duration-200"
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        フィルター
                        {filterCategory !== "all" && (
                          <span className="ml-2 w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </button>
                      
                      {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-large z-10">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-foreground mb-3">カテゴリ</h4>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="category"
                                  value="all"
                                  checked={filterCategory === "all"}
                                  onChange={(e) => setFilterCategory(e.target.value)}
                                  className="w-4 h-4 text-primary"
                                />
                                <span className="ml-2 text-sm text-foreground">すべて</span>
                              </label>
                              {Object.entries(categorySettings).map(([key, setting]) => (
                                <label key={key} className="flex items-center">
                                  <input
                                    type="radio"
                                    name="category"
                                    value={key}
                                    checked={filterCategory === key}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-4 h-4 text-primary"
                                  />
                                  <span className="ml-2 text-sm text-foreground">{setting.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex bg-secondary rounded-2xl p-1">
                      <button
                        onClick={() => setViewMode("calendar")}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                          viewMode === "calendar"
                            ? 'bg-white text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        カレンダー
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                          viewMode === "list"
                            ? 'bg-white text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <List className="w-4 h-4 mr-2" />
                        リスト
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SlideIn>

            <FadeIn delay={0.3}>
              {viewMode === "list" ? (
                <ModernListView 
                  schedules={filteredSchedules}
                  onScheduleClick={handleEventClick}
                />
              ) : (
                <ModernCalendar
                  onEventClick={handleEventClick}
                  onDateSelect={handleDateSelect}
                  onEventChange={handleEventChange}
                />
              )}
            </FadeIn>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}