export function extractStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isSupabaseStorageUrl =
    trimmed.includes("supabase.co") &&
    (trimmed.includes("/storage/v1/object/public/") ||
      trimmed.includes("/storage/v1/object/sign/"));

  if (!trimmed.startsWith("http") || !isSupabaseStorageUrl) {
    return trimmed;
  }

  const storagePatterns = [
    "/storage/v1/object/public/",
    "/storage/v1/object/sign/",
  ];

  for (const pattern of storagePatterns) {
    if (trimmed.includes(pattern)) {
      const suffix = trimmed.split(pattern)[1];
      if (!suffix) return trimmed;

      const parts = suffix.split("/");
      if (parts.length < 2) return trimmed;

      return parts.slice(1).join("/").split("?")[0] || trimmed;
    }
  }

  return trimmed;
}