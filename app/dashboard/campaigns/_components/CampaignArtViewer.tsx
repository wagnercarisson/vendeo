import React from "react";
import { Phone } from "lucide-react";

export type CampaignArtViewerProps = {
    layout: "solid" | "floating" | "split";
    variant?: "full" | "thumbnail";
    image_url: string;
    headline: string;
    body_text: string;
    cta: string;
    price?: number | string | null;
    price_label?: string | null;
    store?: {
        name?: string | null;
        address?: string | null;
        whatsapp?: string | null;
        phone?: string | null;
        logo_url?: string | null;
        primary_color?: string | null;
        secondary_color?: string | null;
    } | null;
    containerRef?: React.RefObject<HTMLDivElement>;
    cardRef?: React.RefObject<HTMLDivElement>;
    badgeRef?: React.RefObject<HTMLDivElement>;
    badgeLabelRef?: React.RefObject<HTMLParagraphElement>;
    badgePriceRef?: React.RefObject<HTMLParagraphElement>;
    storePillRef?: React.RefObject<HTMLSpanElement>;
    headlineRef?: React.RefObject<HTMLHeadingElement>;
    bodyTextRef?: React.RefObject<HTMLParagraphElement>;
    ctaRef?: React.RefObject<any>;
    whatsappRef?: React.RefObject<HTMLDivElement>;
    waIconRef?: React.RefObject<HTMLImageElement>;
    waTextRef?: React.RefObject<HTMLSpanElement>;
    addressRef?: React.RefObject<HTMLParagraphElement>;
};

export function CampaignArtViewer({
    layout,
    variant = "full",
    image_url,
    headline,
    body_text,
    cta,
    price,
    price_label,
    store,
    containerRef,
    cardRef,
    badgeRef,
    badgeLabelRef,
    badgePriceRef,
    storePillRef,
    headlineRef,
    bodyTextRef,
    ctaRef,
    whatsappRef,
    waIconRef,
    waTextRef,
    addressRef,
}: CampaignArtViewerProps) {
    const primary_color = store?.primary_color || "#10b981";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const secondary_color = store?.secondary_color || "#064e3b";

    const formatPrice = (p?: number | string | null) => {
        if (!p) return "";
        const num = typeof p === "string" ? parseFloat(p.replace(",", ".")) : p;
        if (isNaN(num) || num <= 0) return "";
        return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const formattedPrice = formatPrice(price);
    const hasEffectivePrice = formattedPrice && formattedPrice.trim() !== "";
    const hasEffectiveLabel = price_label && price_label.trim() !== "";

    const formatWhatsApp = (val?: string | null) => {
        if (!val) return null;
        const cleaned = val.replace(/\D/g, "");
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return val;
    };

    const whatsappDisplay = formatWhatsApp(store?.whatsapp || store?.phone);

    if (variant === "thumbnail") {
        return (
            <div className="relative h-full w-full overflow-hidden bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image_url || ""} alt="" className="h-full w-full object-cover" />
                {formattedPrice && (
                    <div className="absolute bottom-1 right-1 rounded border border-white/20 bg-emerald-600/90 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur shadow-sm">
                        {formattedPrice}
                    </div>
                )}
            </div>
        );
    }

    if (layout === "floating") {
        return (
            <div ref={containerRef} className="w-full max-w-md mx-auto aspect-[4/5] relative group overflow-hidden bg-zinc-900 shadow-2xl rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image_url || ""} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {(hasEffectivePrice || hasEffectiveLabel) && (
                    <div className="absolute right-4 top-4 rotate-6 transform transition-transform hover:scale-110 z-10">
                        <div 
                            ref={badgeRef}
                            className="rounded-xl border-2 border-white px-4 py-2 text-center shadow-2xl flex flex-col items-center justify-center min-w-[126px]" 
                            style={{ backgroundColor: primary_color }}
                        >
                            {hasEffectiveLabel && (
                                <p 
                                    ref={badgeLabelRef}
                                    className={`font-bold uppercase text-white/85 leading-none ${hasEffectivePrice ? "text-[9px] mb-1" : "text-sm py-1"}`}
                                >
                                    {price_label}
                                </p>
                            )}
                            {hasEffectivePrice && (
                                <p 
                                    ref={badgePriceRef}
                                    className="text-xl font-black text-white leading-none tracking-tighter"
                                >
                                    {formattedPrice}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                    <div ref={cardRef} className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 p-4 text-white shadow-2xl space-y-2.5 max-w-[95%] mx-auto">
                        <div className="mb-1">
                            <span 
                                ref={storePillRef}
                                className="inline-block rounded px-3 py-1 text-[8px] font-bold uppercase text-white" 
                                style={{ backgroundColor: primary_color }}
                            >
                                {store?.name}
                            </span>
                        </div>
                        <h3 
                            ref={headlineRef}
                            className="text-xl font-black leading-tight tracking-[0.5px] italic break-words"
                        >
                            {headline}
                        </h3>
                        <p 
                            ref={bodyTextRef}
                            className="text-[11px] font-medium text-zinc-200 line-clamp-2 leading-tight mt-1.5 mb-2 px-0.5"
                        >
                            {body_text}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <div className="text-[8px] opacity-80 font-medium">
                                <p className="font-bold flex items-center gap-1.5 mb-1 text-[10px]">
                                    <img 
                                        ref={waIconRef}
                                        src="/whatsapp.png" 
                                        alt="" 
                                        className="h-3 w-3 inline-block" 
                                    />
                                    <span ref={waTextRef} className="inline-block leading-none">{whatsappDisplay}</span>
                                </p>
                                <p ref={addressRef} className="truncate max-w-[120px] opacity-70 block leading-none">{store?.address}</p>
                            </div>
                            <button ref={ctaRef} className="rounded-lg bg-white px-5 py-2 text-[11px] font-black text-zinc-900 uppercase shadow-lg min-w-[130px] text-center leading-none flex items-center justify-center">
                                {cta}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (layout === "split") {
        return (
            <div ref={containerRef} className="w-full max-w-md mx-auto aspect-[4/5] relative flex bg-zinc-900 shadow-2xl rounded-lg overflow-hidden">
                <div className="w-[50%] relative overflow-hidden border-r border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image_url || ""} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between text-left relative overflow-hidden">
                    <div className="space-y-4">
                        <div className="flex items-center gap-[5px]">
                            {store?.logo_url && (
                                <div className="h-9 w-9 rounded-full overflow-hidden border border-white/20 shrink-0 shadow-lg">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                                </div>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-[0px]" style={{ color: primary_color }}>
                                {store?.name}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black leading-tight text-white italic tracking-[0.5px]">
                                {headline}
                            </h3>
                            <div className="h-1 w-10 rounded-full" style={{ backgroundColor: primary_color }} />
                            <p className="text-[11px] font-medium text-zinc-400 leading-relaxed italic line-clamp-4">
                                 {body_text}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        {(hasEffectivePrice || hasEffectiveLabel) && (
                            <div className="space-y-0.5">
                                {hasEffectiveLabel && (
                                    <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">
                                        {price_label}
                                    </p>
                                )}
                                {hasEffectivePrice && (
                                    <p className="text-3xl font-black text-white tracking-tighter" style={{ color: primary_color }}>
                                        {formattedPrice}
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <div className="rounded-lg bg-white px-4 py-3 text-center text-[10px] font-black text-zinc-900 uppercase tracking-widest shadow-xl line-clamp-2">
                            {cta}
                        </div>

                        <div className="text-[8px] text-zinc-500 space-y-0.5 border-t border-white/5 pt-3">
                            <p className="font-bold text-white/70 flex items-center gap-1">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <div ref={whatsappRef} className="flex items-center space-x-1.5 shrink-0">
                                    <div ref={waIconRef} className="text-white">
                                        <img src="/whatsapp.png" className="h-2.5 w-2.5 mr-0.5" alt="" />
                                    </div>
                                    <span ref={waTextRef} className="inline-block leading-none">{whatsappDisplay}</span>
                                 </div>
                            </p>
                            <p className="truncate">{store?.address}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default "solid" layout
    return (
        <div ref={containerRef} className="w-full max-w-md mx-auto aspect-[4/5] relative flex flex-col bg-white shadow-2xl rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <div className="relative h-[55%] w-full overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image_url || ""} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {(hasEffectivePrice || hasEffectiveLabel) && (
                    <div className="absolute top-4 right-4 z-10 transition-transform hover:scale-110">
                        <div ref={badgeRef} className="rounded-xl border-2 border-white px-4 py-2 shadow-xl flex flex-col items-center justify-center min-w-[126px]" style={{ backgroundColor: primary_color }}>
                            {hasEffectiveLabel && (
                                <p ref={badgeLabelRef} className={`font-bold uppercase text-white/90 leading-none ${hasEffectivePrice ? "text-[9px] mb-1" : "text-sm py-1"}`}>
                                    {price_label}
                                </p>
                            )}
                            {hasEffectivePrice && (
                                <p ref={badgePriceRef} className="text-xl font-black text-white leading-none tracking-tighter">{formattedPrice}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div ref={cardRef} className="flex-1 p-5 flex flex-col justify-between text-left overflow-auto">
                <div className="space-y-0.5">
                    <span ref={storePillRef} className="text-[10px] font-bold uppercase tracking-[0.5px] truncate block mb-1.5 leading-none" style={{ color: primary_color }}>
                        {store?.name}
                    </span>
                    <h3 ref={headlineRef} className="text-xl font-black leading-tight text-zinc-900 italic line-clamp-2 tracking-[0.5px]">
                        {headline}
                    </h3>
                    <p ref={bodyTextRef} className="text-[13px] font-medium text-zinc-600 line-clamp-3 leading-tight pt-1.5">
                        {body_text}
                    </p>
                </div>
                <div className="pt-4 flex items-end justify-between border-t border-zinc-100 mt-2 shrink-0 gap-2">
                    <div className="text-[9px] text-zinc-400 font-medium max-w-[55%]">
                        {whatsappDisplay && (
                            <div className="flex items-center gap-1.5 font-bold text-zinc-600 mb-1 text-[10px]">
                                <img ref={waIconRef} src="/whatsapp.png" alt="" className="h-3 w-3 inline-block" />
                                <span ref={waTextRef} className="truncate">{whatsappDisplay}</span>
                            </div>
                        )}
                        <p ref={addressRef} className="truncate opacity-70">{store?.address}</p>
                    </div>
                    <div ref={ctaRef} className="rounded-lg bg-zinc-900 px-6 py-2.5 text-[11px] font-black text-white uppercase tracking-tight min-w-[140px] text-center line-clamp-2">
                        {cta}
                    </div>
                </div>
            </div>
        </div>
    );
}
