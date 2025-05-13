import { authMiddleware } from '@clerk/nextjs/server';
 
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/health",
    "/sign-in(.*)",  // Match all sign-in routes including dynamic ones
    "/sign-up(.*)",  // Match all sign-up routes including dynamic ones
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*|.+\\.[\\w]+$)", // Ignore static files
    "/api/health",
  ]
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};