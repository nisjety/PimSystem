'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-brand-gradient">PIM System</h1>
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "bg-white dark:bg-gray-800 shadow-md rounded-xl border border-gray-200 dark:border-gray-700",
            headerTitle: "text-gray-900 dark:text-white",
            headerSubtitle: "text-gray-500 dark:text-gray-400",
          }
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}