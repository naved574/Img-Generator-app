import { NextResponse, type NextRequest } from "next/server";

import { setRefreshCookie } from "../../_lib/cookies";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";

export async function POST(request: NextRequest) {
  try {
    await ensureMongo();
    const [{ loginSchema }, { login }] = await Promise.all([
      import("../../../../../backend/dist/validators/auth.schema.js"),
      import("../../../../../backend/dist/services/auth.service.js"),
    ]);
    const session = await login(loginSchema.parse(await request.json()));
    const response = NextResponse.json({ user: session.user, accessToken: session.accessToken });
    setRefreshCookie(response, session.refreshToken);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
