import type {
    CampaignGenerationState,
    CampaignPreviewData,
} from "./types";
import { PreviewEmptyState } from "./PreviewEmptyState";
import { PreviewLoadingState } from "./PreviewLoadingState";
import { PreviewReadyState } from "./PreviewReadyState";

type CampaignPreviewPanelProps = {
    generationState: CampaignGenerationState;
    preview: CampaignPreviewData | null;
    onUpdatePreview: (next: CampaignPreviewData) => void;
    generate_post: boolean;
    generate_reels: boolean;
    onRegenerateArt?: () => void;
    onRegenerateReels?: () => void;
    isRegenerating?: boolean;
    onEditingChange?: (isEditing: boolean) => void;
};

export function CampaignPreviewPanel({
    generationState,
    preview,
    onUpdatePreview,
    generate_post,
    generate_reels,
    onRegenerateArt,
    onRegenerateReels,
    isRegenerating = false,
    onEditingChange,
}: CampaignPreviewPanelProps) {
    if (generationState === "generating") {
        return <PreviewLoadingState />;
    }

    if (generationState === "ready" && preview) {
        return (
            <PreviewReadyState
                preview={preview}
                onUpdatePreview={onUpdatePreview}
                generate_post={generate_post}
                generate_reels={generate_reels}
                onRegenerateArt={onRegenerateArt}
                onRegenerateReels={onRegenerateReels}
                isRegenerating={isRegenerating}
                onEditingChange={onEditingChange}
            />
        );
    }

    return <PreviewEmptyState />;
}