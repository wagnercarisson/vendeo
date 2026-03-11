export type CampaignContentType = "product" | "service" | "info";

export type CampaignFormData = {
    type: CampaignContentType;
    productName: string;
    description?: string;
    price: string;
    imageUrl: string;
};

export type StrategyData = {
    audience: string;
    objective: string;
    productPositioning: string;
    reasoning?: string;
    source: "ai" | "manual" | null;
    generatePost: boolean;
    generateReels: boolean;
};

export type CampaignPreviewData = {
    imageUrl?: string;
    headline?: string;
    bodyText?: string;
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
    reelsHook?: string;
    reelsScript?: string;
    reelsShotlist?: {
        scene: number;
        camera: string;
        action: string;
        dialogue: string;
    }[];
    reelsAudioSuggestion?: string;
    reelsDurationSeconds?: number;
    reelsOnScreenText?: string[];
    reelsCaption?: string;
    reelsCta?: string;
    reelsHashtags?: string;
};

export type CampaignGenerationState =
    | "idle"
    | "generating"
    | "ready"
    | "error";