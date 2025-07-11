"use client";

import { motion } from "framer-motion";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// 開発中は認証チェックをスキップ
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // TODO: 本番環境では Clerk認証を有効化
  // const { isLoaded, isSignedIn } = useUser();
  // 開発中は常に認証済みとして扱う
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}