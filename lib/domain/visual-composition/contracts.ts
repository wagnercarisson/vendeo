import { z } from "zod";

import {
    NormalizedBoxSchema,
    VisualReaderOutputSchema,
} from "@/lib/visual-reader/contracts";

export const VISUAL_PIPELINE_SCHEMA_VERSION = "visual-pipeline/v1" as const;

const HexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);

const NullableUrlSchema = z.string().url().nullable();

const FrameSchema = z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().positive(),
    height: z.number().positive(),
}).strict();

const TypographyTokenSchema = z.object({
    family: z.string().min(1),
    weight: z.number().int().positive(),
    size_px: z.number().positive(),
    line_height_px: z.number().positive(),
    italic: z.boolean().default(false),
    letter_spacing_px: z.number().default(0),
}).strict();

const TextSlotSchema = z.object({
    visible: z.boolean(),
    frame: FrameSchema,
    text: z.string().nullable(),
    color: z.string().min(1),
    align: z.enum(["left", "center", "right"]),
    max_lines: z.number().int().positive(),
    typography: TypographyTokenSchema,
}).strict();

const ImageSlotSchema = z.object({
    visible: z.boolean(),
    frame: FrameSchema,
    source_url: z.string().url(),
    fit: z.enum(["cover", "contain"]),
    focal_box: NormalizedBoxSchema.nullable(),
    border_radius_px: z.number().min(0).default(0),
}).strict();

const ShapeSlotSchema = z.object({
    visible: z.boolean(),
    frame: FrameSchema,
    fill: z.string().min(1),
    stroke: z.string().min(1).nullable(),
    stroke_width_px: z.number().min(0),
    border_radius_px: z.number().min(0),
    opacity: z.number().min(0).max(1).default(1),
}).strict();

export const CampaignVisualBriefSchema = z.object({
    schema_version: z.literal(VISUAL_PIPELINE_SCHEMA_VERSION),
    campaign_id: z.string().min(1),
    store_id: z.string().min(1),
    origin: z.enum(["manual", "plan"]),
    weekly_plan_item_id: z.string().nullable(),
    campaign_type: z.enum(["post", "reels", "both"]).nullable(),
    content_type: z.enum(["product", "service", "info", "message"]).nullable(),
    product_name: z.string().nullable(),
    price: z.number().nullable(),
    price_label: z.string().nullable(),
    objective: z.string().nullable(),
    audience: z.string().nullable(),
    product_positioning: z.string().nullable(),
    image: z.object({
        source_url: z.string().url(),
        asset_role: z.enum(["product", "approved_art", "reference"]).default("product"),
        crop_id: z.string().nullable().optional(),
    }).strict(),
    copy: z.object({
        headline: z.string().nullable(),
        body_text: z.string().nullable(),
        cta: z.string().nullable(),
        caption: z.string().nullable().optional(),
        hashtags: z.string().nullable().optional(),
    }).strict(),
}).strict();

export const BrandProfileSchema = z.object({
    schema_version: z.literal(VISUAL_PIPELINE_SCHEMA_VERSION),
    store_id: z.string().min(1),
    store_name: z.string().min(1),
    contact: z.object({
        whatsapp: z.string().nullable(),
        phone: z.string().nullable(),
    }).strict(),
    location: z.object({
        address: z.string().nullable(),
        neighborhood: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
    }).strict(),
    visual: z.object({
        primary_color: HexColorSchema.nullable(),
        secondary_color: HexColorSchema.nullable(),
        logo_url: NullableUrlSchema,
    }).strict(),
    voice: z.object({
        tone_of_voice: z.string().nullable(),
        brand_positioning: z.string().nullable(),
    }).strict(),
}).strict();

export const VisualIntentSchema = z.object({
    schema_version: z.literal(VISUAL_PIPELINE_SCHEMA_VERSION),
    intent_id: z.string().min(1),
    campaign_id: z.string().min(1),
    store_id: z.string().min(1),
    template_family: z.enum(["solid", "floating", "split"]),
    composition_type: z.enum(["text_dominant", "balanced", "product_dominant"]),
    subject: z.object({
        source: z.enum(["reader_exact", "reader_category_only", "campaign_fallback", "no_subject"]),
        box: NormalizedBoxSchema.nullable(),
        anchor: z.enum(["left", "center", "right"]),
        preserve_entire_subject: z.boolean(),
        expansion_mode: z.enum(["none", "conservative", "moderate"]),
    }).strict(),
    text_policy: z.object({
        emphasis: z.enum(["low", "medium", "high"]),
        max_headline_lines: z.number().int().positive(),
        max_body_lines: z.number().int().positive(),
        cta_visibility: z.boolean(),
    }).strict(),
    offer_policy: z.object({
        price_visibility: z.boolean(),
        price_style: z.enum(["badge", "inline", "hidden"]),
        store_signature: z.enum(["logo_and_name", "name_only", "hidden"]),
        contact_mode: z.enum(["whatsapp", "phone", "hidden"]),
    }).strict(),
    background_policy: z.object({
        mode: z.enum(["keep", "overlay", "blur", "solid_fill"]),
        overlay_strength: z.enum(["none", "low", "medium", "high"]),
    }).strict(),
    layout_constraints: z.object({
        safe_zones: z.array(NormalizedBoxSchema),
        avoid_subject_overlap: z.boolean(),
        minimum_margin_ratio: z.number().min(0).max(1),
    }).strict(),
    decision_trace: z.object({
        fallback_level: z.enum(["none", "campaign_only", "conservative"]),
        reader_reliance: z.enum(["high", "medium", "low"]),
        notes: z.array(z.string()),
    }).strict(),
}).strict();

export const CompositionSpecSchema = z.object({
    schema_version: z.literal(VISUAL_PIPELINE_SCHEMA_VERSION),
    spec_id: z.string().min(1),
    campaign_id: z.string().min(1),
    store_id: z.string().min(1),
    canvas: z.object({
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        safe_margin_px: z.number().int().min(0),
    }).strict(),
    template: z.object({
        family: z.enum(["solid", "floating", "split"]),
        variant: z.string().min(1),
    }).strict(),
    tokens: z.object({
        colors: z.object({
            primary: z.string().min(1),
            secondary: z.string().min(1).nullable(),
            text_dark: z.string().min(1),
            text_light: z.string().min(1),
            overlay: z.string().min(1).nullable(),
        }).strict(),
        typography: z.object({
            headline: TypographyTokenSchema,
            body: TypographyTokenSchema,
            cta: TypographyTokenSchema,
            badge: TypographyTokenSchema,
            meta: TypographyTokenSchema,
        }).strict(),
    }).strict(),
    assets: z.object({
        hero_image: z.object({
            url: z.string().url(),
            focal_box: NormalizedBoxSchema.nullable(),
        }).strict(),
        logo: z.object({
            url: NullableUrlSchema,
        }).strict(),
    }).strict(),
    slots: z.object({
        hero: ImageSlotSchema,
        headline: TextSlotSchema,
        body: TextSlotSchema,
        cta: ShapeSlotSchema.extend({
            label: z.string().nullable(),
            text_color: z.string().min(1),
            typography: TypographyTokenSchema,
        }).strict(),
        price_badge: ShapeSlotSchema.extend({
            label: z.string().nullable(),
            price_text: z.string().nullable(),
            text_color: z.string().min(1),
            label_typography: TypographyTokenSchema,
            price_typography: TypographyTokenSchema,
        }).strict(),
        store_signature: z.object({
            visible: z.boolean(),
            frame: FrameSchema,
            logo_frame: FrameSchema.nullable(),
            store_name: z.string().nullable(),
            store_name_typography: TypographyTokenSchema,
            text_color: z.string().min(1),
        }).strict(),
        contact: z.object({
            visible: z.boolean(),
            frame: FrameSchema,
            icon: z.enum(["whatsapp", "phone", "none"]),
            text: z.string().nullable(),
            text_color: z.string().min(1),
            typography: TypographyTokenSchema,
        }).strict(),
    }).strict(),
}).strict();

const RendererImageNodeSchema = z.object({
    kind: z.literal("image"),
    id: z.string().min(1),
    frame: FrameSchema,
    source_url: z.string().url(),
    fit: z.enum(["cover", "contain"]),
    opacity: z.number().min(0).max(1).default(1),
    border_radius_px: z.number().min(0).default(0),
    z_index: z.number().int(),
}).strict();

const RendererTextNodeSchema = z.object({
    kind: z.literal("text"),
    id: z.string().min(1),
    frame: FrameSchema,
    text: z.string(),
    color: z.string().min(1),
    align: z.enum(["left", "center", "right"]),
    typography: TypographyTokenSchema,
    max_lines: z.number().int().positive(),
    z_index: z.number().int(),
}).strict();

const RendererShapeNodeSchema = z.object({
    kind: z.literal("shape"),
    id: z.string().min(1),
    frame: FrameSchema,
    fill: z.string().min(1),
    stroke: z.string().min(1).nullable(),
    stroke_width_px: z.number().min(0),
    border_radius_px: z.number().min(0),
    opacity: z.number().min(0).max(1).default(1),
    z_index: z.number().int(),
}).strict();

const RendererIconNodeSchema = z.object({
    kind: z.literal("icon"),
    id: z.string().min(1),
    frame: FrameSchema,
    icon: z.enum(["whatsapp", "phone"]),
    color: z.string().min(1),
    z_index: z.number().int(),
}).strict();

export const RendererInputSchema = z.object({
    schema_version: z.literal(VISUAL_PIPELINE_SCHEMA_VERSION),
    renderer: z.enum(["canvas-2d"]),
    canvas: z.object({
        width: z.number().int().positive(),
        height: z.number().int().positive(),
    }).strict(),
    assets: z.array(z.object({
        id: z.string().min(1),
        url: z.string().url(),
        role: z.enum(["hero", "logo"]),
    }).strict()),
    nodes: z.array(z.union([
        RendererImageNodeSchema,
        RendererTextNodeSchema,
        RendererShapeNodeSchema,
        RendererIconNodeSchema,
    ])),
}).strict();

export const VisualPipelineInputSchema = z.object({
    campaign: CampaignVisualBriefSchema,
    brand: BrandProfileSchema,
    reader: VisualReaderOutputSchema,
}).strict();

export type CampaignVisualBrief = z.infer<typeof CampaignVisualBriefSchema>;
export type BrandProfile = z.infer<typeof BrandProfileSchema>;
export type VisualIntent = z.infer<typeof VisualIntentSchema>;
export type CompositionSpec = z.infer<typeof CompositionSpecSchema>;
export type RendererInput = z.infer<typeof RendererInputSchema>;
export type VisualPipelineInput = z.infer<typeof VisualPipelineInputSchema>;