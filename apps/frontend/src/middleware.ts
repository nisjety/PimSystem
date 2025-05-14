import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/health",
  "/sign-in(.*)",  // Match all sign-in routes including dynamic ones
  "/sign-up(.*)",  // Match all sign-up routes including dynamic ones
]);

// Use clerkMiddleware with the correct pattern
export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to proceed without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
 
  // Get the auth object by awaiting the function
  const session = await auth();
  
  // Redirect to sign-in if the user isn't authenticated
  if (!session || !session.userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};