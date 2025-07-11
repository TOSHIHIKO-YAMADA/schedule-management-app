"use client";

import { Calendar, Clock, CheckCircle, ArrowRight, Sparkles, Users, Car } from "lucide-react";
import Link from "next/link";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn, SlideIn } from "@/components/animations/PageTransition";
import { InteractiveCard, InteractiveButton } from "@/components/animations/InteractiveCard";

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <SlideIn direction="down" delay={0.1}>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-8">
                  <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">最新のスケジュール管理システム</span>
                </div>
              </SlideIn>
              
              <FadeIn delay={0.2}>
                <h1 className="text-5xl font-bold gradient-text sm:text-6xl md:text-7xl mb-6">
                  スケジュール管理
                  <br />
                  <span className="text-foreground">を革新する</span>
                </h1>
              </FadeIn>
              
              <SlideIn direction="up" delay={0.3}>
                <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                  チーム全体の効率性を向上させる、直感的で美しいスケジュール管理プラットフォーム。
                  車両管理から通知システムまで、すべてが統合されています。
                </p>
              </SlideIn>
              
              <FadeIn delay={0.4}>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <InteractiveButton 
                      variant="primary" 
                      size="lg"
                      className="group shadow-colored hover:shadow-large"
                    >
                      今すぐ始める
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </InteractiveButton>
                  </Link>
                  
                  <Link href="/schedules">
                    <InteractiveButton 
                      variant="secondary" 
                      size="lg"
                      className="border-2 border-primary/20 hover:border-primary/40 shadow-soft hover:shadow-medium"
                    >
                      スケジュール確認
                    </InteractiveButton>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn delay={0.5}>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  すべてが統合された管理システム
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  組織の様々なニーズに対応する、包括的な機能セットを提供します
                </p>
              </div>
            </FadeIn>
            
            <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Schedule Management */}
              <StaggerItem>
                <InteractiveCard className="p-8 bg-card rounded-3xl shadow-soft border border-border/50" hoverScale={1.02}>
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">
                    スケジュール管理
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    直感的なインターフェースで予定を管理。繰り返し予定や複雑なスケジューリングにも対応。
                  </p>
                </InteractiveCard>
              </StaggerItem>

            {/* Vehicle Management */}
            <div className="group p-8 bg-card rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border border-border/50">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6 group-hover:bg-emerald-200 transition-colors">
                <Car className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                車両管理
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                車両の使用予定を効率的に管理。重複予約の防止や車検日のアラート機能付き。
              </p>
            </div>

            {/* Team Management */}
            <div className="group p-8 bg-card rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border border-border/50">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6 group-hover:bg-purple-200 transition-colors">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                権限管理
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                組織の階層に応じた柔軟な権限設定。セキュアで効率的なアクセス制御を実現。
              </p>
            </div>

            {/* Notifications */}
            <div className="group p-8 bg-card rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border border-border/50">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-6 group-hover:bg-orange-200 transition-colors">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                リマインダー機能
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                重要な予定を見逃さない。メールやLINEでの通知機能で確実にお知らせ。
              </p>
            </div>

            {/* Task Management */}
            <div className="group p-8 bg-card rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border border-border/50">
              <div className="flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-2xl mb-6 group-hover:bg-cyan-200 transition-colors">
                <CheckCircle className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                タスク管理
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                やるべきことを整理し、優先順位を付けて効率的に作業を進められます。
              </p>
            </div>

            {/* Advanced Features */}
            <div className="group p-8 bg-card rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border border-border/50">
              <div className="flex items-center justify-center w-16 h-16 bg-pink-100 rounded-2xl mb-6 group-hover:bg-pink-200 transition-colors">
                <Sparkles className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                高度な機能
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                レポート機能、データエクスポート、API連携など、ビジネスを加速する機能群。
              </p>
            </div>
            </StaggerContainer>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <FadeIn delay={0.8}>
              <h2 className="text-3xl font-bold text-white mb-4">
                今すぐ効率的な管理を始めませんか？
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                無料でお試しいただけます。設定は5分で完了。
              </p>
              <Link href="/dashboard">
                <InteractiveButton 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-blue-600 shadow-large hover:shadow-xl"
                >
                  無料で始める
                  <ArrowRight className="ml-2 h-5 w-5" />
                </InteractiveButton>
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
