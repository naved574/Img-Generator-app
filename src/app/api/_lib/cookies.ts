import type { NextResponse } from "next/server";

export const REFRESH_COOKIE = "lumen_refresh";

export function setRefreshCookie(response: NextResponse, token: string) {
  response.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
