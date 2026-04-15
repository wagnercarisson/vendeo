"use client";

import { useRef, useState } from "react";

type TargetBox = { x: number; y: number; width: number; height: number };
type ReaderOutput = {
    matchType: "exact" | "category_only" | "none";
    matchedTarget: string | null;
    confidence: "low" | "medium" | "high";
    detected: boolean;
    reasoningSummary: string;
    targetBox: TargetBox | null;
    sceneType: "single_product" | "multiple_products" | "lifestyle_scene" | "full_scene" | "unclear";
    targetOccupancy: "low" | "medium" | "high" | "full";
    targetOrientation: "vertical" | "horizontal" | "square" | "mixed" | "unknown";
    targetPosition: "left" | "center" | "right" | "top" | "bottom" | "mixed" | "unknown";
    imageQuality: "good" | "acceptable" | "poor" | "unknown";
    visibility: "clear" | "partial" | "obstructed" | "unknown";
    framing: "good" | "tight" | "distant" | "unknown";
    backgroundNoise: "low" | "medium" | "high" | "unknown";
    backgroundType: "transparent" | "solid" | "simple" | "complex" | "unknown";
    hasBackground: "true" | "false" | "unknown";
    subjectCutoff: "none" | "light" | "moderate" | "severe" | "unknown";
    safeExpansionPotential: "low" | "medium" | "high";
    focusClarity: "low" | "medium" | "high" | "unknown";
    visualIsolation: "low" | "medium" | "high" | "unknown";
    relevantCount: number;
    ignoredElements: string[];
    [key: string]: unknown;
};

const DISPLAY_W = 400;

export default function VisualReaderSandboxPage() {
    const [imageUrl, setImageUrl] = useState("");
    const [targetLabel, setTargetLabel] = useState("");
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [campaignType, setCampaignType] = useState<"" | "single_product" | "multiple_products" | "info">("");
    const [contentType, setContentType] = useState("");
    const [loading, setLoading] = useState(false);
    const [reader, setReader] = useState<ReaderOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setReader(null);
        setError(null);
        setImgSize(null);

        try {
            const res = await fetch("/api/sandbox/visual-reader/crop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageUrl,
                    targetLabel,
                    ...(productName ? { productName } : {}),
                    ...(category ? { category } : {}),
                    ...(campaignType ? { campaignType } : {}),
                    ...(contentType ? { content_type: contentType } : {}),
                }),
            });
            const data = await res.json();
            setReader(data.reader);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    }

    function handleImageLoad() {
        if (imgRef.current) {
            setImgSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
        }
    }

    const box = reader?.targetBox ?? null;
    const displayH = imgSize ? (imgSize.h / imgSize.w) * DISPLAY_W : DISPLAY_W;

    const boxPx = box && imgSize
        ? { x: box.x * DISPLAY_W, y: box.y * displayH, w: box.width * DISPLAY_W, h: box.height * displayH }
        : null;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-6">Visual Reader — Crop Sandbox</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mb-10">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Image URL *</label>
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="https://..." />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Target Label *</label>
                    <input type="text" value={targetLabel} onChange={(e) => setTargetLabel(e.target.value)} required
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="ex: refrigerante" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Product Name (opcional)</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="ex: Coca Cola 600ml" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Category (opcional)</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Campaign Type (opcional)</label>
                    <select
                        value={campaignType}
                        onChange={(e) => setCampaignType(e.target.value as "" | "single_product" | "multiple_products" | "info")}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    >
                        <option value="">(não informar)</option>
                        <option value="single_product">single_product</option>
                        <option value="multiple_products">multiple_products</option>
                        <option value="info">info</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">content_type (opcional)</label>
                    <input
                        type="text"
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                        placeholder="ex: info"
                    />
                </div>
                <button type="submit" disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2 font-medium text-sm">
                    {loading ? "Analisando..." : "Analisar"}
                </button>
            </form>

            {error && <div className="text-red-400 mb-6 text-sm">Erro: {error}</div>}

            {reader && (
                <>
                    <div className="mb-6 bg-gray-800 rounded p-4 max-w-2xl grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-400 block text-xs uppercase">matchType</span><span className="font-mono font-semibold">{reader.matchType}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">confidence</span><span className="font-mono font-semibold">{reader.confidence}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">detected</span><span className="font-mono font-semibold">{String(reader.detected)}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">matchedTarget</span><span className="font-mono font-semibold">{reader.matchedTarget ?? "null"}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">sceneType</span><span className="font-mono font-semibold">{reader.sceneType}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">targetOccupancy</span><span className="font-mono font-semibold">{reader.targetOccupancy}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">targetOrientation</span><span className="font-mono font-semibold">{reader.targetOrientation}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">targetPosition</span><span className="font-mono font-semibold">{reader.targetPosition}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">imageQuality</span><span className="font-mono font-semibold">{reader.imageQuality}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">visibility</span><span className="font-mono font-semibold">{reader.visibility}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">framing</span><span className="font-mono font-semibold">{reader.framing}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">backgroundNoise</span><span className="font-mono font-semibold">{reader.backgroundNoise}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">backgroundType</span><span className="font-mono font-semibold">{reader.backgroundType}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">hasBackground</span><span className="font-mono font-semibold">{reader.hasBackground}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">subjectCutoff</span><span className="font-mono font-semibold">{reader.subjectCutoff}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">safeExpansionPotential</span><span className="font-mono font-semibold">{reader.safeExpansionPotential}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">focusClarity</span><span className="font-mono font-semibold">{reader.focusClarity}</span></div>
                        <div><span className="text-gray-400 block text-xs uppercase">visualIsolation</span><span className="font-mono font-semibold">{reader.visualIsolation}</span></div>
                        {reader.reasoningSummary && (
                            <div className="col-span-2"><span className="text-gray-400 block text-xs uppercase">reasoningSummary</span><span className="italic text-gray-300">{reader.reasoningSummary}</span></div>
                        )}
                    </div>

                    <div className="flex gap-10 mb-8 flex-wrap items-start">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Original + Box</span>
                            <div style={{ position: "relative", width: DISPLAY_W, height: displayH }} className="rounded border border-gray-700 overflow-hidden bg-gray-900">
                                <img ref={imgRef} src={imageUrl} alt="original" onLoad={handleImageLoad}
                                    style={{ width: DISPLAY_W, height: displayH, display: "block", objectFit: "fill" }} />
                                {boxPx && (
                                    <div style={{
                                        position: "absolute", left: boxPx.x, top: boxPx.y, width: boxPx.w, height: boxPx.h,
                                        border: "2px solid red", backgroundColor: "rgba(255,0,0,0.1)", boxSizing: "border-box", pointerEvents: "none",
                                    }} />
                                )}
                            </div>
                            {!box && <div className="text-xs text-yellow-500">Sem bounding box retornada</div>}
                        </div>
                    </div>

                    <div className="max-w-3xl">
                        <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Raw JSON</span>
                        <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
                            {JSON.stringify(reader, null, 2)}
                        </pre>
                    </div>
                </>
            )}
        </div>
    );
}