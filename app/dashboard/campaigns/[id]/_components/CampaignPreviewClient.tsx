"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Copy, Check, Sparkles, ArrowLeft, Wand2, Video, Upload, Loader2 } from "lucide-react";

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

type Store = {
    id: string;
    name: string;
    city: string | null;
    state: string | null;

    brand_positioning: string | null;
    main_segment: string | null;
    tone_of_voice: string | null;

    address: string | null;
    neighborhood: string | null;
    phone: string | null;
    whatsapp: string | null;
    instagram: string | null;

    primary_color: string | null;
    secondary_color: string | null;
};

type ReelsShot = {
    scene: number;
    camera: string;
    action: string;
    dialogue: string;
};

type Campaign = {
    id: string;
    store_id?: string;

    product_name: string;
    price: number | null;
    audience: string | null;
    objective: string | null;

    image_url: string | null;
    headline: string | null;
    body_text: string | null;
    cta: string | null;

    product_positioning: string | null;

    ai_caption: string | null;
    ai_text: string | null;
    ai_hashtags: string | null;
    ai_cta: string | null;
    ai_generated_at: string | null;

    reels_hook: string | null;
    reels_script: string | null;
    reels_shotlist: ReelsShot[] | null;
    reels_on_screen_text: string[] | null;
    reels_audio_suggestion: string | null;
    reels_duration_seconds: number | null;
    reels_caption: string | null;
    reels_cta: string | null;
    reels_hashtags: string | null;
    reels_generated_at: string | null;

    stores?: Store | null;
};

function Field({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {label}
            </div>
            <div className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap">{value}</div>
        </div>
    );
}

function Empty({ title, hint }: { title: string; hint?: string }) {
    return (
        <div className="rounded-xl border border-dashed border-black/10 bg-zinc-50 px-4 py-4">
            <div className="text-sm font-semibold text-zinc-800">{title}</div>
            {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
        </div>
    );
}

function Card({
    title,
    subtitle,
    children,
    right,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4">
                <div>
                    <div className="text-sm font-semibold text-zinc-900">{title}</div>
                    {subtitle ? <div className="mt-0.5 text-xs text-zinc-500">{subtitle}</div> : null}
                </div>
                {right}
            </div>
            <div className="px-5 py-4">{children}</div>
        </section>
    );
}

function useCopy() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    async function copy(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1200);
        } catch { }
    }

    return { copiedKey, copy };
}

function isLikelyUnconfiguredRemote(url: string) {
    try {
        const u = new URL(url);
        if (u.hostname === "ibassets.com.br") return true;
        return false;
    } catch {
        return false;
    }
}

function safeToString(v: any) {
    if (v === null || v === undefined) return "";
    return String(v);
}

export function CampaignPreviewClient({ campaign }: { campaign: Campaign }) {
    const router = useRouter();
    const { copiedKey, copy } = useCopy();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [loadingText, setLoadingText] = useState(false);
    const [loadingReels, setLoadingReels] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const uploadTimerRef = useRef<number | null>(null);
    const uploadStartRef = useRef<number>(0);

    function isValidImageFile(file: File) {
        return file.type.startsWith("image/");
    }

    const hasAi = !!campaign.ai_generated_at || (campaign.ai_caption ?? "").trim().length > 0;
    const hasReels = !!campaign.reels_generated_at;

    const bestHeadline = campaign.headline || campaign.product_name;
    const bestBody = campaign.ai_text || campaign.body_text || "";
    const bestCTA = campaign.ai_cta || campaign.cta || "";
    const bestCaption = campaign.ai_caption || "";
    const bestHashtags = campaign.ai_hashtags || "";

    const priceText = useMemo(() => {
        if (campaign.price === null || campaign.price === undefined) return null;
        try {
            return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(campaign.price));
        } catch {
            return String(campaign.price);
        }
    }, [campaign.price]);

    function buildGenerateTextPayload(force: boolean) {
        return {
            campaign_id: campaign.id,
            force,

            product_name: campaign.product_name,
            price: campaign.price,
            audience: campaign.audience,
            objective: campaign.objective,

            product_positioning: campaign.product_positioning,

            store_name: campaign.stores?.name,
            city: campaign.stores?.city,
            state: campaign.stores?.state,
            brand_positioning: campaign.stores?.brand_positioning,
            main_segment: campaign.stores?.main_segment,
            tone_of_voice: campaign.stores?.tone_of_voice,

            whatsapp: campaign.stores?.whatsapp,
            phone: campaign.stores?.phone,
            instagram: campaign.stores?.instagram,

            primary_color: campaign.stores?.primary_color,
            secondary_color: campaign.stores?.secondary_color,
        };
    }

    function buildGenerateReelsPayload(force: boolean) {
        // Mantém compatível com seu back atual (mesma ideia do texto).
        return {
            campaign_id: campaign.id,
            force,

            product_name: campaign.product_name,
            price: campaign.price,
            audience: campaign.audience,
            objective: campaign.objective,

            product_positioning: campaign.product_positioning,

            store_name: campaign.stores?.name,
            city: campaign.stores?.city,
            state: campaign.stores?.state,
            brand_positioning: campaign.stores?.brand_positioning,
            main_segment: campaign.stores?.main_segment,
            tone_of_voice: campaign.stores?.tone_of_voice,

            whatsapp: campaign.stores?.whatsapp,
            phone: campaign.stores?.phone,
            instagram: campaign.stores?.instagram,

            primary_color: campaign.stores?.primary_color,
            secondary_color: campaign.stores?.secondary_color,
        };
    }

    async function generateText(force = false) {
        try {
            setErrorMsg(null);
            setLoadingText(true);

            const res = await fetch("/api/generate/campaign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildGenerateTextPayload(force)),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.details ?? err?.error ?? `Erro na API: ${res.status}`);
            }

            await res.json().catch(() => null);
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Erro ao gerar/salvar texto");
        } finally {
            setLoadingText(false);
        }
    }

    async function generateReels(force = false) {
        try {
            setErrorMsg(null);
            setLoadingReels(true);

            const res = await fetch("/api/generate/reels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildGenerateReelsPayload(force)),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.details ?? err?.error ?? `Erro na API: ${res.status}`);
            }

            await res.json().catch(() => null);
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Erro ao gerar/salvar Reels");
        } finally {
            setLoadingReels(false);
        }
    }

    function openFilePicker() {
        if (uploadingImage) return;
        fileInputRef.current?.click();
    }

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (uploadingImage) return;
        if (!dragOver) setDragOver(true);
    }

    function onDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }

    async function onDrop(e: React.DragEvent) {
        if (uploadingImage) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const file = e.dataTransfer?.files?.[0] ?? null;
        if (!file) return;

        if (!isValidImageFile(file)) {
            setErrorMsg("Envie um arquivo de imagem (JPG, PNG, WEBP…).");
            return;
        }

        await onFileSelected(file);
    }

    async function onFileSelected(file: File | null) {
        if (!file) return;

        const maxMb = 8;
        if (file.size > maxMb * 1024 * 1024) {
            setErrorMsg(`Imagem muito grande. Máximo: ${maxMb}MB.`);
            return;
        }

        try {
            setErrorMsg(null);
            setUploadingImage(true);
            setUploadProgress(0);
            uploadStartRef.current = Date.now();

            if (uploadTimerRef.current) window.clearInterval(uploadTimerRef.current);

            uploadTimerRef.current = window.setInterval(() => {
                setUploadProgress((prev) => {
                    // Fase 1: sobe rápido até 55%
                    if (prev < 55) return prev + 6;

                    // Fase 2: sobe moderado até 80%
                    if (prev < 80) return prev + 2;

                    // Fase 3: bem lento até 90% (não passa disso sem concluir)
                    if (prev < 90) return prev + 1;

                    return prev; // segura em 90%
                });
            }, 180);

            // ✅ agora usa o supabase do app (sessão compartilhada)
            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("Você precisa estar logado para enviar imagem.");

            const safeName = file.name.replace(/[^\w.\-]+/g, "_");
            const path = `${campaign.id}/${Date.now()}_${safeName}`;

            const { error: upErr } = await supabase.storage
                .from("campaign-images")
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: file.type,
                });

            if (upErr) throw new Error(upErr.message);

            const { data: pub } = supabase.storage.from("campaign-images").getPublicUrl(path);
            const publicUrl = pub?.publicUrl;
            if (!publicUrl) throw new Error("Falha ao obter URL pública da imagem.");

            const { error: dbErr } = await supabase
                .from("campaigns")
                .update({ image_url: publicUrl })
                .eq("id", campaign.id);

            if (dbErr) throw new Error(dbErr.message);

            const minMs = 1200; // tempo mínimo para a UX não "piscar"
            const elapsed = Date.now() - uploadStartRef.current;
            const wait = Math.max(0, minMs - elapsed);

            window.setTimeout(() => {
                setUploadProgress(100);

                window.setTimeout(() => {
                    setUploadProgress(0);
                }, 450);
            }, wait);

            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message || "Erro ao enviar imagem.");
            setUploadProgress(0);
        } finally {
            try {
                // @ts-ignore - t existe no escopo do try; se não existir, ignora
                if (typeof t !== "undefined") window.clearInterval(t);
            } catch { }
            if (uploadTimerRef.current) {
                window.clearInterval(uploadTimerRef.current);
                uploadTimerRef.current = null;
            }
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/dashboard/campaigns"
                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para campanhas
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-xs text-zinc-700">
                        <Sparkles className="h-4 w-4" />
                        <span>{hasAi ? "Conteúdo gerado por IA" : "Conteúdo ainda não gerado"}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => generateText(false)}
                        disabled={loadingText}
                        className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                    >
                        <Wand2 className="h-4 w-4" />
                        {loadingText ? "Gerando texto..." : "Gerar texto com IA"}
                    </button>

                    {hasAi && (
                        <button
                            type="button"
                            onClick={() => generateText(true)}
                            disabled={loadingText}
                            className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                        >
                            Regenerar texto
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => generateReels(false)}
                        disabled={loadingReels}
                        className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                    >
                        <Video className="h-4 w-4" />
                        {loadingReels ? "Gerando Reels..." : hasReels ? "Gerar Reels (já existe)" : "Gerar Reels"}
                    </button>

                    {hasReels && (
                        <button
                            type="button"
                            onClick={() => generateReels(true)}
                            disabled={loadingReels}
                            className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                        >
                            Regenerar Reels
                        </button>
                    )}
                </div>
            </div>

            {errorMsg ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-6">
                    <Card
                        title="Arte / imagem"
                        subtitle="Envie a foto do produto direto do seu computador ou celular."
                        right={
                            <div className="flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
                                />
                                <button
                                    type="button"
                                    onClick={openFilePicker}
                                    disabled={uploadingImage}
                                    className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                                >
                                    {uploadingImage ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Enviar foto
                                        </>
                                    )}
                                </button>
                                {uploadingImage && (
                                    <div className="absolute inset-x-0 bottom-0">
                                        <div className="px-3 pb-3">
                                            <div className="rounded-xl border border-black/10 bg-white/90 p-3 shadow-sm backdrop-blur">
                                                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                                                    <span>Enviando imagem…</span>
                                                    <span>{Math.min(100, Math.max(0, uploadProgress))}%</span>
                                                </div>

                                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-600 transition-[width] duration-200"
                                                        style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
                                                    />
                                                </div>

                                                <div className="mt-1 text-[11px] text-zinc-500">
                                                    Não feche esta página durante o envio.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                    >
                        <div
                            className={cx(
                                "relative overflow-hidden rounded-2xl border bg-zinc-50 transition",
                                dragOver ? "border-emerald-400 ring-4 ring-emerald-200/50" : "border-black/5"
                            )}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                        >
                            {campaign.image_url ? (
                                <div className="relative aspect-square">
                                    {isLikelyUnconfiguredRemote(campaign.image_url) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={campaign.image_url}
                                            alt={campaign.product_name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                    ) : (
                                        <Image
                                            src={campaign.image_url}
                                            alt={campaign.product_name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 420px"
                                        />
                                    )}

                                    {/* hint discreto no canto */}
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent p-3">
                                        <div className="text-xs font-semibold text-white/95">
                                            Arraste uma nova imagem aqui para substituir
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid aspect-square place-items-center px-8 text-center">
                                    <div>
                                        <div className="text-sm font-semibold text-zinc-800">Arraste e solte a foto aqui</div>
                                        <div className="mt-1 text-xs text-zinc-500">
                                            ou clique em <span className="font-semibold">“Enviar foto”</span>.
                                        </div>
                                        <div className="mt-4 text-[11px] text-zinc-500">
                                            Formatos: JPG/PNG/WEBP · Máx: 8MB
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* overlay quando arrastando */}
                            {dragOver && (
                                <div className="pointer-events-none absolute inset-0 grid place-items-center bg-emerald-500/10">
                                    <div className="rounded-2xl border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                                        Solte para enviar
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 grid gap-3">
                            <Field label="Produto" value={campaign.product_name} />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Preço" value={priceText} />
                                <Field label="Objetivo" value={campaign.objective} />
                            </div>
                            <Field label="Público" value={campaign.audience} />
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <Card
                        title="Texto do post"
                        subtitle="Headline + corpo + CTA (pronto para usar)."
                        right={
                            <button
                                onClick={() =>
                                    copy("post", [bestHeadline, "", bestBody, "", bestCTA].filter(Boolean).join("\n"))
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                                type="button"
                                disabled={!bestBody && !bestCTA}
                            >
                                {copiedKey === "post" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                Copiar tudo
                            </button>
                        }
                    >
                        <div className="space-y-3">
                            <div className="rounded-xl border border-black/5 bg-zinc-50 px-4 py-3">
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Headline</div>
                                <div className="mt-1 text-base font-semibold text-zinc-900">{bestHeadline}</div>
                            </div>

                            {bestBody ? (
                                <div className="rounded-xl border border-black/5 bg-white px-4 py-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Texto</div>
                                    <div className="mt-1 text-sm text-zinc-800 whitespace-pre-wrap">{bestBody}</div>
                                </div>
                            ) : (
                                <Empty title="Texto ainda não gerado" hint="Clique em “Gerar texto com IA” acima para preencher automaticamente." />
                            )}

                            {bestCTA ? (
                                <div className="rounded-xl border border-black/5 bg-white px-4 py-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">CTA</div>
                                    <div className="mt-1 text-sm font-medium text-zinc-900 whitespace-pre-wrap">{bestCTA}</div>
                                </div>
                            ) : (
                                <Empty title="CTA ainda não gerado" hint="O Vendeo cria uma chamada para ação alinhada ao objetivo." />
                            )}
                        </div>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card
                            title="Legenda"
                            subtitle="Pronta para Instagram/FB."
                            right={
                                bestCaption ? (
                                    <button
                                        onClick={() => copy("caption", bestCaption)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        type="button"
                                    >
                                        {copiedKey === "caption" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        Copiar
                                    </button>
                                ) : null
                            }
                        >
                            {bestCaption ? (
                                <div className="text-sm text-zinc-800 whitespace-pre-wrap">{bestCaption}</div>
                            ) : (
                                <Empty title="Legenda ainda não gerada" hint="Gere o texto com IA para criar uma legenda pronta para postar." />
                            )}
                        </Card>

                        <Card
                            title="Hashtags"
                            subtitle="Copie e cole."
                            right={
                                bestHashtags ? (
                                    <button
                                        onClick={() => copy("hashtags", bestHashtags)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        type="button"
                                    >
                                        {copiedKey === "hashtags" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        Copiar
                                    </button>
                                ) : null
                            }
                        >
                            {bestHashtags ? (
                                <div className="text-sm text-zinc-800 whitespace-pre-wrap">{bestHashtags}</div>
                            ) : (
                                <Empty title="Hashtags ainda não geradas" hint="O Vendeo sugere hashtags locais e de intenção de compra." />
                            )}
                        </Card>
                    </div>

                    {(campaign.reels_hook || campaign.reels_script || hasReels) && (
                        <Card title="Reels" subtitle="Hook + roteiro (quando gerado).">
                            <div className="space-y-3">
                                {campaign.reels_hook ? (
                                    <Field label="Hook" value={safeToString(campaign.reels_hook)} />
                                ) : (
                                    <Empty title="Hook ainda não gerado" hint="Clique em “Gerar Reels” acima." />
                                )}

                                {campaign.reels_script ? (
                                    <Field label="Roteiro" value={safeToString(campaign.reels_script)} />
                                ) : (
                                    <Empty title="Roteiro ainda não gerado" hint="Clique em “Gerar Reels” acima." />
                                )}

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Legenda reels" value={safeToString(campaign.reels_caption)} />
                                    <Field label="CTA reels" value={safeToString(campaign.reels_cta)} />
                                </div>

                                <Field label="Hashtags reels" value={safeToString(campaign.reels_hashtags)} />
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}