"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ColoredTopLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Route change detected
    setLoading(true);
    setProgress(0);
    
    // 標準的なロード時間（本番用）
    let loadTime = 300; // 適度なフィードバック時間
    let color = '#3b82f6'; // プライマリカラー
    
    // プログレスバーをアニメーション
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (loadTime / 50); // 50msごとに更新
        if (prev >= 95) {
          return 95; // 95%で止めて、完了時に100%にする
        }
        return Math.min(prev + increment, 95);
      });
    }, 50);

    // 完了処理
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        // Loading completed
      }, 100);
    }, loadTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
      setLoading(false);
      setProgress(0);
    };
  }, [pathname]);

  if (!loading) return null;

  // 統一されたプライマリカラー
  const barColor = '#3b82f6';

  return (
    <div 
      className="fixed top-0 left-0 z-[9999] h-2 transition-all duration-100 ease-out"
      style={{ 
        width: `${progress}%`,
        backgroundColor: barColor,
        boxShadow: `0 0 10px ${barColor}`
      }}
    />
  );
}