# Product Image Internalization — Handoff to @dev

**From:** @aiox-master (Orion)  
**To:** @dev (Dex)  
**Date:** 2026-04-26  
**Priority:** HIGH  
**Type:** Bug Fix + Risk Mitigation

---

## 🎯 Problem Statement

**Current State:**
```json
{
  "image_url": "campaigns/.../variation-3.png",  // ✅ Storage (Motor 4 output)
  "product_image_url": "https://sitiorosadovale.com/..."  // ❌ External URL
}
```

**Risk:** External URLs can break/change, causing:
- Motor 1 (Visual Reader) failures
- Inconsistent campaign assets
- Broken campaign displays in future

**User Quote:**
> "deveria puxar a imagem e salvar no bucket pq se a fonte por algum motivo alterar ou deletar a imagem vamos ter inconsistência no futuro"

---

## ✅ Solution Approved: Option A (Preventive Upload)

**Strategy:** Internalize external URLs to Supabase Storage BEFORE Motor 1-4 pipeline

**When:** During `generateCampaignContent`, after campaign fetch, before visual pipeline

**Storage Path:** `stores/{storeId}/products/{campaignId}/source.webp`

**Bucket:** `campaign-images` (same as Motor 4 outputs)

---

## 📋 Implementation Spec

### File: `lib/domain/campaigns/service.ts`

**1. Create internalization function** (insert after imports, ~line 30):

```typescript
/**
 * Internalizes external product image URLs to Supabase Storage.
 * If URL is already a Storage path, returns as-is.
 * Downloads external image, uploads to Storage, returns Storage path.
 */
async function internalizeProductImage(
  imageUrl: string,
  campaignId: string,
  storeId: string
): Promise<string> {
  // Already internalized (Storage path)
  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  console.log(`[INTERNALIZE] Downloading external image: ${imageUrl.substring(0, 80)}...`);

  // Download from external URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`IMAGE_DOWNLOAD_FAILED: HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Storage
  const path = `stores/${storeId}/products/${campaignId}/source.webp`;
  const supabaseAdmin = getSupabaseAdmin();
  
  const { error } = await supabaseAdmin.storage
    .from("campaign-images")
    .upload(path, buffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    console.error("[INTERNALIZE] Storage upload failed:", error);
    throw new Error(`STORAGE_UPLOAD_FAILED: ${error.message}`);
  }

  console.log(`[INTERNALIZE] ✅ Saved to Storage: ${path}`);
  return path;
}
```

**2. Integrate into generation flow** (in `generateCampaignContent`, after idempotency check, ~line 150):

```typescript
// After the idempotency block (if (!force && already && ...) { return ... })
// Before "3) Validação mínima dos dados da campanha"

// 2.5) Internalize external product image URL to Storage
if (campaign.product_image_url) {
  try {
    const internalPath = await internalizeProductImage(
      campaign.product_image_url,
      campaign_id,
      storeId
    );

    // Update DB if URL was externalized
    if (internalPath !== campaign.product_image_url) {
      const { error: updateErr } = await supabaseAdmin
        .from("campaigns")
        .update({ product_image_url: internalPath })
        .eq("id", campaign_id);

      if (updateErr) {
        console.error("[INTERNALIZE] DB update failed:", updateErr);
        // Non-blocking: continue with internal path even if DB update fails
      }

      campaign.product_image_url = internalPath; // Use Storage path for pipeline
    }
  } catch (error) {
    console.error("[INTERNALIZE] Failed to internalize image:", error);
    // DECISION: Allow generation to continue with external URL
    // Motor 1 can still process external URLs via assertImageReachable
  }
}
```

---

## 🧪 Acceptance Criteria

### Manual Testing
1. Create new campaign with external URL (e.g., `https://example.com/product.jpg`)
2. Trigger generation (`POST /api/generate/campaign`)
3. Verify console logs show `[INTERNALIZE] Downloading...` → `✅ Saved to Storage`
4. Check DB: `product_image_url` should be `stores/{storeId}/products/{campaignId}/source.webp`
5. Verify Supabase Storage: file exists in `campaign-images` bucket
6. Regenerate same campaign (force=false): should skip internalization (already Storage path)

### Edge Cases
- [ ] Already Storage path → no-op (returns immediately)
- [ ] External URL download fails → logs error, continues with external URL
- [ ] Storage upload fails → logs error, continues with external URL
- [ ] DB update fails → logs warning, continues (non-blocking)

### Regression Tests
- [ ] Existing campaigns with external URLs still work
- [ ] Motor 1-4 pipeline still validates 100% (GPT-4.1 + Prompt V4)
- [ ] Campaign list displays correctly (both old external + new Storage URLs)

---

## 📊 Performance Impact

- **One-time cost:** 1-3s per campaign (download + upload)
- **Subsequent generations:** 0s (idempotent, skips if already Storage path)
- **Storage usage:** ~100KB-2MB per product image (acceptable)

---

## 🔗 Related Work

- **Story 4.5.2:** Motor 3 GPT-4.1 migration (COMPLETED, pending commit)
- **Next.js Image Error:** Root cause identified (external URLs), fixed by this change

---

## 🚀 Next Steps

1. **@dev:** Implement above changes in `service.ts`
2. **@dev:** Manual test with external URL campaign
3. **@dev:** Verify edge cases (already Storage, download fail, etc.)
4. **@dev:** Commit with Story 4.5.2 changes (atomic commit)
5. **@devops:** Push to remote after @dev confirms tests pass

---

## 📝 Notes

- **Non-blocking design:** If internalization fails, generation continues with external URL
- **Backward compatible:** Existing campaigns with external URLs still work via `assertImageReachable` fallback
- **Storage path format:** Matches existing conventions (`stores/{storeId}/...`)
- **WEBP format:** Optimized for storage efficiency (can adjust if needed)

---

**Status:** Ready for Implementation  
**Blocker:** None  
**ETA:** 30-45 minutes (implementation + testing)
