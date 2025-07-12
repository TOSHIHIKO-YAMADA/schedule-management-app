import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 開発中は認証チェックをスキップ
export function middleware(request: NextRequest) {
  // TODO: 本番環境では Clerk認証を有効化
  // import { clerkMiddleware } from '@clerk/nextjs/server'
  // return clerkMiddleware()(request)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}