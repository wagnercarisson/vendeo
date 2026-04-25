import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();
const fromMock = vi.fn(() => ({
  upload: uploadMock,
  getPublicUrl: getPublicUrlMock,
}));
const createClientMock = vi.fn(() => ({
  storage: {
    from: fromMock,
  },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("uploadRenderedArt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({
      data: {
        publicUrl: "https://example.supabase.co/storage/v1/object/public/campaign-images/campaigns/c-1/variation-0.png",
      },
    });
  });

  it("returns the relative storage path after uploading", async () => {
    const { uploadRenderedArt } = await import("@/lib/ai/renderer/storage");

    const result = await uploadRenderedArt({
      path: "campaigns/c-1/variation-0.png",
      buffer: Buffer.from("png"),
    });

    expect(result).toBe("campaigns/c-1/variation-0.png");
    expect(uploadMock).toHaveBeenCalledOnce();
    expect(getPublicUrlMock).not.toHaveBeenCalled();
  });
});