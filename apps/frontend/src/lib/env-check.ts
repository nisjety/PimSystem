const requiredEnvVariables = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
] as const;

function checkEnvVariables() {
  for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
      throw new Error(`Environment variable ${variable} is not set`);
    }
  }
}

checkEnvVariables();
