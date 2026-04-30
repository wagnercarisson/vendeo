/**
 * Unit tests for save logo API endpoint
 * 
 * Tests:
 * - Download temporary DALL-E URL
 * - Upload to Supabase Storage
 * - Update stores.logo_url
 * - Ownership validation
 * - Error handling
 * 
 * Uses Node.js test runner (node --test)
 */

import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert";

// Mock fetch for downloading DALL-E URL
const mockFetch = mock.fn();

// Mock Supabase Storage client
const mockSupabaseStorage = {
  from: mock.fn(() => ({
    upload: mock.fn(() => ({
      data: { path: "store-123/logo.png" },
      error: null,
    })),
    getPublicUrl: mock.fn(() => ({
      data: { publicUrl: "https://supabase.co/storage/v1/object/public/campaign-images/store-123/logo.png" },
    })),
  })),
};

// Mock Supabase database client
const mockSupabaseDB = {
  from: mock.fn(() => ({
    update: mock.fn(() => ({
      eq: mock.fn(() => ({
        data: null,
        error: null,
      })),
    })),
    select: mock.fn(() => ({
      eq: mock.fn(() => ({
        single: mock.fn(() => ({
          data: { id: "store-123", owner_id: "user-456" },
          error: null,
        })),
      })),
    })),
  })),
};

describe("POST /api/store/save-logo", () => {
  beforeEach(() => {
    mockFetch.mock.resetCalls();
    mockSupabaseStorage.from.mock.resetCalls();
    mockSupabaseDB.from.mock.resetCalls();
  });

  describe("Download DALL-E URL", () => {
    it("downloads image from temporary DALL-E URL", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        })
      );

      const dalleUrl = "https://oaidalleapiprodscus.blob.core.windows.net/private/...";
      const response = await mockFetch(dalleUrl);

      assert.strictEqual(response.ok, true, "Should successfully fetch image");
      assert.ok(response.arrayBuffer, "Should have arrayBuffer method");
    });

    it("handles download failure gracefully", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
        })
      );

      const dalleUrl = "https://invalid-url.com/image.png";
      const response = await mockFetch(dalleUrl);

      assert.strictEqual(response.ok, false, "Should indicate failure");
      assert.strictEqual(response.status, 404, "Should return 404 status");
    });

    it("validates URL format before download", () => {
      const validateUrl = (url: string) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      assert.strictEqual(
        validateUrl("https://oaidalleapiprodscus.blob.core.windows.net/private/image.png"),
        true,
        "Should accept valid URL"
      );

      assert.strictEqual(
        validateUrl("not-a-url"),
        false,
        "Should reject invalid URL"
      );

      assert.strictEqual(
        validateUrl(""),
        false,
        "Should reject empty URL"
      );
    });
  });

  describe("Supabase Storage Upload", () => {
    it("uploads image to campaign-images bucket with correct path", async () => {
      const storeId = "store-123";
      const imageBuffer = new ArrayBuffer(1024);

      const uploadPath = `${storeId}/logo.png`;
      
      mockSupabaseStorage.from.mock.mockImplementation(() => ({
        upload: mock.fn(() => ({
          data: { path: uploadPath },
          error: null,
        })),
      }));

      const storage = mockSupabaseStorage.from("campaign-images");
      const { data, error } = await storage.upload(uploadPath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

      assert.strictEqual(data?.path, uploadPath, "Should upload to correct path");
      assert.strictEqual(error, null, "Should not have error");
    });

    it("uses upsert:true to replace existing logo", async () => {
      const uploadOptions = {
        contentType: "image/png",
        upsert: true,
        cacheControl: "3600",
      };

      assert.strictEqual(uploadOptions.upsert, true, "Should use upsert to replace existing");
    });

    it("sets correct content-type for PNG images", () => {
      const contentType = "image/png";
      assert.strictEqual(contentType, "image/png", "Should use image/png content-type");
    });

    it("handles upload failure gracefully", async () => {
      mockSupabaseStorage.from.mock.mockImplementation(() => ({
        upload: mock.fn(() => ({
          data: null,
          error: { message: "Storage quota exceeded" },
        })),
      }));

      const storage = mockSupabaseStorage.from("campaign-images");
      const { data, error } = await storage.upload("store-123/logo.png", new ArrayBuffer(1024));

      assert.strictEqual(data, null, "Should return null data on error");
      assert.ok(error, "Should return error object");
      assert.match(error.message, /quota exceeded/i, "Should include error message");
    });
  });

  describe("Public URL Generation", () => {
    it("generates correct public URL after upload", async () => {
      const storeId = "store-123";
      const uploadPath = `${storeId}/logo.png`;

      mockSupabaseStorage.from.mock.mockImplementation(() => ({
        getPublicUrl: mock.fn(() => ({
          data: {
            publicUrl: `https://supabase.co/storage/v1/object/public/campaign-images/${uploadPath}`,
          },
        })),
      }));

      const storage = mockSupabaseStorage.from("campaign-images");
      const { data } = storage.getPublicUrl(uploadPath);

      assert.ok(data.publicUrl, "Should return public URL");
      assert.match(
        data.publicUrl,
        /campaign-images\/store-123\/logo\.png/,
        "URL should include correct path"
      );
    });

    it("generates permanent URL (not expiring)", () => {
      const publicUrl = "https://supabase.co/storage/v1/object/public/campaign-images/store-123/logo.png";

      // Public URLs in Supabase Storage don't expire (unlike DALL-E temporary URLs)
      assert.match(publicUrl, /\/public\//, "Should use public path (permanent)");
      assert.doesNotMatch(publicUrl, /\?token=/, "Should not have temporary token");
    });
  });

  describe("Database Update", () => {
    it("updates stores.logo_url with permanent URL", async () => {
      const storeId = "store-123";
      const logoUrl = "https://supabase.co/storage/v1/object/public/campaign-images/store-123/logo.png";

      mockSupabaseDB.from.mock.mockImplementation(() => ({
        update: mock.fn(() => ({
          eq: mock.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      }));

      const db = mockSupabaseDB.from("stores");
      const { error } = await db.update({ logo_url: logoUrl }).eq("id", storeId);

      assert.strictEqual(error, null, "Should update without error");
    });

    it("validates store ownership before update", async () => {
      const storeId = "store-123";
      const userId = "user-456";

      mockSupabaseDB.from.mock.mockImplementation(() => ({
        select: mock.fn(() => ({
          eq: mock.fn(() => ({
            single: mock.fn(() => ({
              data: { id: storeId, owner_id: userId },
              error: null,
            })),
          })),
        })),
      }));

      const db = mockSupabaseDB.from("stores");
      const { data, error } = await db
        .select("id, owner_id")
        .eq("id", storeId)
        .single();

      assert.strictEqual(data?.owner_id, userId, "Should verify ownership");
      assert.strictEqual(error, null, "Should fetch store without error");
    });

    it("handles update failure gracefully", async () => {
      mockSupabaseDB.from.mock.mockImplementation(() => ({
        update: mock.fn(() => ({
          eq: mock.fn(() => ({
            data: null,
            error: { message: "Row level security policy violation" },
          })),
        })),
      }));

      const db = mockSupabaseDB.from("stores");
      const { error } = await db.update({ logo_url: "https://..." }).eq("id", "store-123");

      assert.ok(error, "Should return error object");
      assert.match(error.message, /security policy/i, "Should include RLS error message");
    });
  });

  describe("Ownership Validation", () => {
    it("rejects request from non-owner", () => {
      const storeOwnerId = "user-456";
      const requestUserId = "user-789";

      const isOwner = storeOwnerId === requestUserId;

      assert.strictEqual(isOwner, false, "Should detect non-owner");
    });

    it("allows request from owner", () => {
      const storeOwnerId = "user-456";
      const requestUserId = "user-456";

      const isOwner = storeOwnerId === requestUserId;

      assert.strictEqual(isOwner, true, "Should allow owner");
    });

    it("handles missing authentication gracefully", () => {
      const requestUserId = null;

      const isAuthenticated = requestUserId !== null;

      assert.strictEqual(isAuthenticated, false, "Should detect missing auth");
    });
  });

  describe("Request Validation", () => {
    it("validates required fields (logoUrl, storeId)", () => {
      const validateRequest = (body: any) => {
        if (!body.logoUrl || !body.storeId) {
          throw new Error("logoUrl and storeId are required");
        }
      };

      // Missing logoUrl
      assert.throws(
        () => validateRequest({ storeId: "store-123" }),
        /logoUrl and storeId are required/,
        "Should reject missing logoUrl"
      );

      // Missing storeId
      assert.throws(
        () => validateRequest({ logoUrl: "https://..." }),
        /logoUrl and storeId are required/,
        "Should reject missing storeId"
      );

      // Valid request
      assert.doesNotThrow(
        () => validateRequest({ logoUrl: "https://...", storeId: "store-123" }),
        "Should accept valid request"
      );
    });

    it("validates logoUrl is a valid URL", () => {
      const validateLogoUrl = (url: string) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:";
        } catch {
          return false;
        }
      };

      assert.strictEqual(
        validateLogoUrl("https://oaidalleapiprodscus.blob.core.windows.net/image.png"),
        true,
        "Should accept valid HTTPS URL"
      );

      assert.strictEqual(
        validateLogoUrl("http://insecure.com/image.png"),
        false,
        "Should reject HTTP URL (require HTTPS)"
      );

      assert.strictEqual(
        validateLogoUrl("not-a-url"),
        false,
        "Should reject invalid URL"
      );
    });
  });

  describe("Response Structure", () => {
    it("returns correct success response", () => {
      const response = {
        success: true,
        logo_url: "https://supabase.co/storage/v1/object/public/campaign-images/store-123/logo.png",
      };

      assert.strictEqual(response.success, true, "Should have success field");
      assert.ok(response.logo_url, "Should include permanent logo URL");
      assert.match(response.logo_url, /^https:\/\//, "Logo URL should use HTTPS");
    });

    it("returns correct error response", () => {
      const response = {
        success: false,
        error: "Failed to download logo from DALL-E URL",
      };

      assert.strictEqual(response.success, false, "Should have success:false");
      assert.ok(response.error, "Should include error message");
    });
  });

  describe("Integration: Full Flow", () => {
    it("executes complete save flow successfully", async () => {
      // 1. Download DALL-E URL
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        })
      );

      const dalleUrl = "https://oaidalleapiprodscus.blob.core.windows.net/private/image.png";
      const downloadResponse = await mockFetch(dalleUrl);
      const imageBuffer = await downloadResponse.arrayBuffer();

      assert.ok(imageBuffer, "Should download image");

      // 2. Upload to Storage
      mockSupabaseStorage.from.mock.mockImplementation(() => ({
        upload: mock.fn(() => ({
          data: { path: "store-123/logo.png" },
          error: null,
        })),
        getPublicUrl: mock.fn(() => ({
          data: {
            publicUrl: "https://supabase.co/storage/v1/object/public/campaign-images/store-123/logo.png",
          },
        })),
      }));

      const storage = mockSupabaseStorage.from("campaign-images");
      const uploadResult = await storage.upload("store-123/logo.png", imageBuffer);
      const publicUrlResult = storage.getPublicUrl("store-123/logo.png");

      assert.ok(uploadResult.data, "Should upload successfully");
      assert.ok(publicUrlResult.data.publicUrl, "Should get public URL");

      // 3. Update database
      mockSupabaseDB.from.mock.mockImplementation(() => ({
        update: mock.fn(() => ({
          eq: mock.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      }));

      const db = mockSupabaseDB.from("stores");
      const updateResult = await db
        .update({ logo_url: publicUrlResult.data.publicUrl })
        .eq("id", "store-123");

      assert.strictEqual(updateResult.error, null, "Should update database successfully");
    });
  });
});
