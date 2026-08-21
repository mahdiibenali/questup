import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!login|api/auth|api/trpc|_next|favicon.ico|manifest.json|sw.js|icons|og).*)",
  ],
};
