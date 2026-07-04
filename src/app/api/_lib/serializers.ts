export function serializeGeneration(g: any) {
  return {
    id: String(g._id),
    prompt: g.prompt,
    negative_prompt: g.negativePrompt,
    model: g.model,
    aspect_ratio: g.aspectRatio,
    seed: g.seed,
    cfg: g.cfg,
    nsfw: g.nsfw,
    image_url: g.imageUrl,
    is_favorite: g.isFavorite,
    is_public: g.isPublic,
    credits_spent: g.creditsSpent,
    created_at: g.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function serializeCredits(account: any) {
  return {
    balance: account.balance,
    daily_allowance: account.dailyAllowance,
    plan: account.plan,
    daily_reset_at: account.dailyResetAt.toISOString(),
  };
}

export function serializeProfile(profile: any) {
  return {
    id: String(profile.userId),
    display_name: profile.displayName,
    handle: profile.handle,
    bio: profile.bio,
    avatar_url: profile.avatarUrl,
    gender: profile.gender,
    gender_public: profile.genderPublic,
  };
}
