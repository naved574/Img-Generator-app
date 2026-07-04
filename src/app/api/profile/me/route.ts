import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../../_lib/auth";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";
import { serializeProfile } from "../../_lib/serializers";

export async function GET(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    const [{ Profile }, { assertFound }] = await Promise.all([
      import("../../../../../backend/dist/models/Profile.js"),
      import("../../../../../backend/dist/utils/httpError.js"),
    ]);
    const profile = assertFound(await Profile.findOne({ userId: user.objectId }), "Profile not found");
    return NextResponse.json(serializeProfile(profile));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    const [{ Profile }, { updateProfileSchema }, { assertFound }] = await Promise.all([
      import("../../../../../backend/dist/models/Profile.js"),
      import("../../../../../backend/dist/validators/auth.schema.js"),
      import("../../../../../backend/dist/utils/httpError.js"),
    ]);
    const data = updateProfileSchema.parse(await request.json());
    const patch: Record<string, unknown> = {};
    if (data.display_name !== undefined) patch.displayName = data.display_name;
    if (data.bio !== undefined) patch.bio = data.bio;
    if (data.gender !== undefined) patch.gender = data.gender;
    if (data.gender_public !== undefined) patch.genderPublic = data.gender_public;
    const profile = assertFound(
      await Profile.findOneAndUpdate({ userId: user.objectId }, patch, { new: true }),
      "Profile not found",
    );
    return NextResponse.json(serializeProfile(profile));
  } catch (error) {
    return jsonError(error);
  }
}
