import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // 認証とAPIルートを使用するため無効化
  // trailingSlash: true, // 静的エクスポートのみで必要
  images: {
    unoptimized: true
  }
};

export default nextConfig;
