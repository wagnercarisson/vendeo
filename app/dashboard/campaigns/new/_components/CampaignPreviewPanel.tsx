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
    generatePost: boolean;
    generateReels: boolean;
    onRegenerateArt?: () => void;
    onRegenerateReels?: () => void;
    isRegenerating?: boolean;
};

export function CampaignPreviewPanel({
    generationState,
    preview,
    onUpdatePreview,
    generatePost,
    generateReels,
    onRegenerateArt,
    onRegenerateReels,
    isRegenerating = false,
}: CampaignPreviewPanelProps) {
    if (generationState === "generating") {
        return <PreviewLoadingState />;
    }

    if (generationState === "ready" && preview) {
        return (
            <PreviewReadyState
                preview={preview}
                onUpdatePreview={onUpdatePreview}
                generatePost={generatePost}
                generateReels={generateReels}
                onRegenerateArt={onRegenerateArt}
                onRegenerateReels={onRegenerateReels}
                isRegenerating={isRegenerating}
            />
        );
    }

    return <PreviewEmptyState />;
}