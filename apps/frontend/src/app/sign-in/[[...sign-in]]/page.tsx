import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-sm",
              card: "rounded-lg border border-gray-200 shadow-sm",
            },
          }}
        />
      </div>
    </div>
  );
}