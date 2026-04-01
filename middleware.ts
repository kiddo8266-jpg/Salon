import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedin = !!req.auth
  const { nextUrl } = req

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/s/")
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register"

  // 1. Allow API Auth routes
  if (isApiAuthRoute) return NextResponse.next()

  // 2. Handle Auth routes (Login/Register)
  if (isAuthRoute) {
    if (isLoggedin) {
      // Use role from session
      const role = req.auth?.user?.role
      return NextResponse.redirect(new URL(role === "SUPER_ADMIN" ? "/admin" : "/dashboard", nextUrl))
    }
    return NextResponse.next()
  }

  // 3. Protect Private Routes
  if (!isLoggedin && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
