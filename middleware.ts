import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect based on role - ser más específico para evitar conflictos
    // Solo redirigir si es exactamente /dashboard/mentee o /dashboard/mentee/*
    // pero NO /dashboard/mentee-details/*
    if (path.startsWith("/dashboard/mentee/") && token?.role !== "mentee") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // También verificar la ruta exacta /dashboard/mentee
    if (path === "/dashboard/mentee" && token?.role !== "mentee") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path === "/dashboard" && token?.role === "mentee") {
      return NextResponse.redirect(new URL("/dashboard/mentee", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};