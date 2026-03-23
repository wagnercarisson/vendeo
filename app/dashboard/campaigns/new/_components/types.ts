export type CampaignContentType = "product" | "service" | "info";

export type CampaignFormData = {
    type: CampaignContentType;
    product_name: string;
    description?: string;
    price: string;
    image_url: string;
};

export type StrategyData = {
    audience: string;
    objective: string;
    product_positioning: string;
    reasoning?: string;
    source: "ai" | "manual" | null;
    generate_post: boolean;
    generate_reels: boolean;
};

export type CampaignPreviewData = {
    image_url?: string;
    headline?: string;
    body_text?: string;
    cta?: string;
    caption?: string;
    hashtags?: string;
    price?: number | string;
    store?: {
        name: string;
        address?: string;
        whatsapp?: string;
        primary_color?: string;
        secondary_color?: string;
        logo_url?: string;
    };
    layout?: "solid" | "floating" | "split";
    reels_hook?: string;
    reels_script?: string;
    reels_shotlist?: {
        scene: number;
        camera: string;
        action: string;
        dialogue: string;
    }[];
    reels_audio_suggestion?: string;
    reels_duration_seconds?: number;
    reels_on_screen_text?: string[];
    reels_caption?: string;
    reels_cta?: string;
    reels_hashtags?: string;
};

export type CampaignGenerationState =
    | "idle"
    | "generating"
    | "ready"
    | "error";