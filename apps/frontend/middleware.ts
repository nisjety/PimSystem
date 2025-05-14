import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/api/health', '/sign-in', '/sign-up']);

export default clerkMiddleware((auth, request) => {
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Call protect() directly on the auth object, not on auth()
  auth.protect();
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};