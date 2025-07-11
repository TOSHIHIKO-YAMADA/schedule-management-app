"use client";

import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold gradient-text">
            スケジュール管理システム
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            新しいアカウントを作成してください
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-primary hover:bg-primary/90 text-primary-foreground',
                card: 'bg-card border border-border shadow-soft',
                headerTitle: 'text-foreground',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 
                  'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border',
                formFieldInput: 
                  'bg-background border-border text-foreground',
                formFieldLabel: 'text-foreground',
                footerActionLink: 'text-primary hover:text-primary/80',
              },
              variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'hsl(var(--background))',
                colorText: 'hsl(var(--foreground))',
                colorInputBackground: 'hsl(var(--background))',
                colorInputText: 'hsl(var(--foreground))',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}