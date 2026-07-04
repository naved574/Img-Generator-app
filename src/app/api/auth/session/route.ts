import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../../_lib/auth";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";

export async function GET(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    return NextResponse.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    return jsonError(error);
  }
}
