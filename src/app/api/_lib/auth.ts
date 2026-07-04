import type { NextRequest } from "next/server";

import { HttpError } from "../../../../backend/dist/utils/httpError.js";

export type NextAuthUser = {
  id: string;
  objectId: unknown;
  email: string;
};

export async function optionalAuth(request: NextRequest): Promise<NextAuthUser | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return null;

  try {
    const [{ default: jwt }, { toObjectId }, { env }] = await Promise.all([
      import("jsonwebtoken"),
      import("../../../../backend/dist/utils/objectId.js"),
      import("../../../../backend/dist/config/env.js"),
    ]);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; email: string };
    return { id: payload.sub, objectId: toObjectId(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await optionalAuth(request);
  if (!user) throw new HttpError(401, "Not authenticated.");
  return user;
}
