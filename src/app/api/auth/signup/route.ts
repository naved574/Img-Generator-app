import { NextResponse, type NextRequest } from "next/server";

import { setRefreshCookie } from "../../_lib/cookies";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";

export async function POST(request: NextRequest) {
  try {
    await ensureMongo();
    const [{ signupSchema }, { signup }] = await Promise.all([
      import("../../../../../backend/dist/validators/auth.schema.js"),
      import("../../../../../backend/dist/services/auth.service.js"),
    ]);
    const session = await signup(signupSchema.parse(await request.json()));
    const response = NextResponse.json({ user: session.user, accessToken: session.accessToken }, { status: 201 });
    setRefreshCookie(response, session.refreshToken);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
