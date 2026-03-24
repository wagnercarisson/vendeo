"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon, X, Package, Ruler, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSignedUrlAction } from "@/lib/supabase/storage-actions";
import type { CampaignFormData, CampaignContentType } from "./types";
import { formatBRLMask } from "@/lib/formatters/priceMask";


type ProductFormCardProps = {
    value: CampaignFormData;
    onChange: (next: CampaignFormData) => void;
    disableTypeSwitch?: boolean;
};

export function ProductFormCard({
    value,
    onChange,
    disableTypeSwitch = false,
}: ProductFormCardProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    function updateField<K extends keyof CampaignFormData>(
        field: K,
        fieldValue: CampaignFormData[K]
    ) {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    }

    const contentTypes: { id: CampaignContentType; label: string; icon: any }[] = [
        { id: "product", label: "Produto", icon: Package },
        { id: "service", label: "Serviço", icon: Ruler },
        { id: "info", label: "Aviso", icon: Megaphone },
    ];

    const labels = {
        product: { 
            title: "Nome da Oferta *", 
            placeholder: "Ex.: Heineken 600ml",
            descLabel: "Detalhes (opcional)",
            descPlaceholder: "Ex.: Long neck, pack com 6 unidades..."
        },
        service: { 
            title: "Nome da Oferta *", 
            placeholder: "Ex.: Lavagem Completa",
            descLabel: "Detalhes (opcional)",
            descPlaceholder: "Ex.: Lavagem externa, aspiração e pretinho..."
        },
        info: { 
            title: "Nome da Oferta *", 
            placeholder: "Ex.: Novo Horário de Atendimento",
            descLabel: "Detalhes (opcional)",
            descPlaceholder: "Ex.: A partir de segunda, passaremos a atender até as 22h..."
        },
    }[value.type];

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
            setUploadProgress(10);

            const { data: auth } = await supabase.auth.getUser();
            if (!auth?.user) throw new Error("Você precisa estar logado para enviar imagem.");

            const safeName = file.name.replace(/[^\w.\-]+/g, "_");
            const timestamp = Date.now();
            const path = `uploads/${auth.user.id}/${timestamp}_${safeName}`;

            setUploadProgress(30);

            const { error: upErr } = await supabase.storage
                .from("campaign-images")
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: file.type,
                });

            if (upErr) throw new Error(upErr.message);

            setUploadProgress(80);

            const { data: pub } = supabase.storage.from("campaign-images").getPublicUrl(path);
            const publicUrl = pub?.publicUrl;
            
            setUploadProgress(100);
            const signedUrl = await getSignedUrlAction(path);
            updateField("image_url", signedUrl || publicUrl);

            setTimeout(() => {
                setUploadingImage(false);
                setUploadProgress(0);
            }, 600);

        } catch (err: any) {
            setErrorMsg(err?.message || "Erro ao enviar imagem.");
            setUploadingImage(false);
            setUploadProgress(0);
        }
    }

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (uploadingImage) return;
        setDragOver(true);
    }

    function onDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }

    async function onDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        if (uploadingImage) return;

        const file = e.dataTransfer?.files?.[0] ?? null;
        if (file && file.type.startsWith("image/")) {
            await onFileSelected(file);
        } else if (file) {
            setErrorMsg("Por favor, envie apenas arquivos de imagem.");
        }
    }

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h2 className="text-sm font-semibold text-zinc-900">
                    O que vamos divulgar?
                </h2>
                <div className="mt-3 flex gap-2 p-1 bg-zinc-50 rounded-xl border border-zinc-200">
                    {contentTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = value.type === type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                disabled={disableTypeSwitch}
                                onClick={() => updateField("type", type.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                                    isSelected
                                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-zinc-200"
                                        : disableTypeSwitch
                                            ? "text-zinc-400 opacity-50 cursor-not-allowed"
                                            : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50"
                                }`}
                            >
                                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-emerald-500" : disableTypeSwitch ? "text-zinc-300" : "text-zinc-400"}`} />
                                {type.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="product_name"
                        className="text-sm font-medium text-zinc-700"
                    >
                        {labels.title}
                    </label>
                    <input
                        id="product_name"
                        type="text"
                        value={value.product_name}
                        onChange={(e) => updateField("product_name", e.target.value)}
                        placeholder={labels.placeholder}
                        className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 placeholder:text-zinc-400"
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="description"
                        className="text-sm font-medium text-zinc-700"
                    >
                        {labels.descLabel}
                    </label>
                    <textarea
                        id="description"
                        value={value.description || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder={labels.descPlaceholder}
                        rows={3}
                        className="w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 placeholder:text-zinc-400 resize-none"
                    />
                </div>

                {value.type !== "info" && (
                    <div className="space-y-1.5">
                        <label htmlFor="price" className="text-sm font-medium text-zinc-700">
                            Preço *
                        </label>
                        <input
                            id="price"
                            type="text"
                            value={value.price}
                            onChange={(e) => updateField("price", formatBRLMask(e.target.value))}
                            placeholder="Ex.: 8,99"
                            className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 placeholder:text-zinc-400"
                        />

                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">
                        Imagem (opcional)
                    </label>

                    {errorMsg && (
                        <div className="mb-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 flex items-center justify-between">
                            <span>{errorMsg}</span>
                            <button onClick={() => setErrorMsg(null)}>
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    <div
                        onClick={() => !uploadingImage && fileInputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 min-h-[120px] flex flex-col items-center justify-center p-4 
                            ${dragOver ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/50"}
                            ${uploadingImage ? "pointer-events-none opacity-80" : ""}`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
                            className="hidden"
                        />

                        {uploadingImage ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                <span className="text-xs font-medium text-zinc-600">Enviando... {uploadProgress}%</span>
                                <div className="w-32 h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-1">
                                    <div 
                                        className="h-full bg-emerald-600 transition-all duration-300" 
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : value.image_url ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={value.image_url}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-1 text-white">
                                        <Upload className="h-5 w-5" />
                                        <span className="text-[10px] font-medium">Trocar imagem</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateField("image_url", "");
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-zinc-600 hover:text-red-500 shadow-sm transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-zinc-600">
                                <div className="p-2 rounded-full bg-white border border-zinc-200 shadow-sm group-hover:shadow transition-all group-hover:-translate-y-0.5">
                                    <ImageIcon className="h-5 w-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-medium">Arraste a foto ou clique para buscar</p>
                                    <p className="text-[10px] mt-0.5">JPG, PNG ou WEBP até 8MB</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative mt-3">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-zinc-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                            <span className="bg-white px-2 text-zinc-400 font-medium">Ou cole a URL</span>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={value.image_url}
                        onChange={(e) => updateField("image_url", e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full h-9 mt-2 rounded-lg border border-zinc-200 px-3 text-xs text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 placeholder:text-zinc-400"
                    />
                </div>

            </div>
        </section>
    );
}