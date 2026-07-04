import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../../_lib/auth";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";

export async function POST(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    const [{ Profile }, { avatarUploadSchema }, { deleteImage, uploadImageBuffer }, { assertFound }] =
      await Promise.all([
        import("../../../../../backend/dist/models/Profile.js"),
        import("../../../../../backend/dist/validators/auth.schema.js"),
        import("../../../../../backend/dist/services/cloudinary.service.js"),
        import("../../../../../backend/dist/utils/httpError.js"),
      ]);
    const data = avatarUploadSchema.parse(await request.json());
    const match = data.data_url.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data URL");
    const profile = assertFound(await Profile.findOne({ userId: user.objectId }), "Profile not found");
    const uploaded = await uploadImageBuffer(Buffer.from(match[2], "base64"), `lumen/avatars/${user.id}`);
    await deleteImage(profile.avatarPublicId);
    profile.avatarUrl = uploaded.secure_url;
    profile.avatarPublicId = uploaded.public_id;
    await profile.save();
    return NextResponse.json({ url: profile.avatarUrl });
  } catch (error) {
    return jsonError(error);
  }
}
