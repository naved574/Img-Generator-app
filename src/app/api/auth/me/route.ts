import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_COOKIE, setRefreshCookie } from "../../_lib/cookies";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";

export async function GET(request: NextRequest) {
  try {
    await ensureMongo();
    const { restoreSession } = await import("../../../../../backend/dist/services/auth.service.js");
    const session = await restoreSession(request.cookies.get(REFRESH_COOKIE)?.value ?? null);
    const response = NextResponse.json({ user: session.user, accessToken: session.accessToken });
    setRefreshCookie(response, session.refreshToken);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
