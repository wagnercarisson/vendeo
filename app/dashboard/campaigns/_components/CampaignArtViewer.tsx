import React from "react";
import { Phone } from "lucide-react";

export type CampaignArtViewerProps = {
    layout: "solid" | "floating" | "split";
    variant?: "full" | "thumbnail";
    imageUrl: string;
    headline: string;
    bodyText: string;
    cta: string;
    price?: number | string | null;
    store?: {
        name?: string | null;
        address?: string | null;
        whatsapp?: string | null;
        phone?: string | null;
        logo_url?: string | null;
        primary_color?: string | null;
        secondary_color?: string | null;
    } | null;
};

export function CampaignArtViewer({
    layout,
    variant = "full",
    imageUrl,
    headline,
    bodyText,
    cta,
    price,
    store,
}: CampaignArtViewerProps) {
    const primaryColor = store?.primary_color || "#10b981";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const secondaryColor = store?.secondary_color || "#064e3b";

    const formatPrice = (p?: number | string | null) => {
        if (!p) return "";
        const num = typeof p === "string" ? parseFloat(p.replace(",", ".")) : p;
        if (isNaN(num)) return p?.toString() || "";
        return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const formattedPrice = formatPrice(price);

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
                <img src={imageUrl || ""} alt="" className="h-full w-full object-cover" />
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
            <div className="relative h-full w-full group overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl || ""} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {formattedPrice && (
                    <div className="absolute right-4 top-4 rotate-6 transform transition-transform hover:scale-110">
                        <div className="rounded-xl border-2 border-white px-4 py-2 text-center shadow-2xl" style={{ backgroundColor: primaryColor }}>
                            <p className="text-[10px] font-bold uppercase text-white/90 leading-none mb-1">Oferta</p>
                            <p className="text-xl font-black text-white leading-none">{formattedPrice}</p>
                        </div>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                    <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 p-4 text-white shadow-2xl space-y-2.5 max-w-[90%]">
                        <div className="space-y-1">
                            <span className="inline-block rounded-md px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest" style={{ backgroundColor: primaryColor }}>
                                {store?.name}
                            </span>
                            <h3 className="text-xl font-black leading-tight tracking-tighter uppercase italic break-words">
                                {headline}
                            </h3>
                        </div>
                        <p className="text-[10px] font-medium text-zinc-200 line-clamp-2 leading-relaxed">
                            {bodyText}
                        </p>
                        <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                            <div className="text-[8px] opacity-80 font-medium">
                                <p className="font-bold flex items-center gap-1">
                                    <Phone className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                                    {whatsappDisplay}
                                </p>
                                <p className="truncate max-w-[120px]">{store?.address}</p>
                            </div>
                            <div className="rounded-lg bg-white px-3 py-1.5 text-[9px] font-black text-zinc-900 uppercase shadow-lg">
                                {cta}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (layout === "split") {
        return (
            <div className="flex h-full w-full bg-zinc-900">
                <div className="w-[50%] relative overflow-hidden border-r border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl || ""} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between text-left relative overflow-hidden">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {store?.logo_url ? (
                                <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20 shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest border-b border-white/10 pb-1 w-full truncate">
                                    {store?.name}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black leading-tight text-white uppercase italic tracking-tighter">
                                {headline}
                            </h3>
                            <div className="h-1 w-10 rounded-full" style={{ backgroundColor: primaryColor }} />
                            <p className="text-[11px] font-medium text-zinc-400 leading-relaxed italic line-clamp-4">
                                 {bodyText}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        {formattedPrice && (
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Valor</p>
                                <p className="text-3xl font-black text-white tracking-tighter" style={{ color: primaryColor }}>
                                    {formattedPrice}
                                </p>
                            </div>
                        )}
                        
                        <div className="rounded-lg bg-white px-4 py-3 text-center text-[10px] font-black text-zinc-900 uppercase tracking-widest shadow-xl line-clamp-2">
                            {cta}
                        </div>

                        <div className="text-[8px] text-zinc-500 space-y-0.5 border-t border-white/5 pt-3">
                            <p className="font-bold text-white/70 flex items-center gap-1">
                                 <Phone className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                                 {whatsappDisplay}
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
        <div className="flex flex-col h-full bg-white">
            <div className="relative h-[55%] w-full overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl || ""} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {formattedPrice && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="rounded-xl border-2 border-white px-4 py-2 shadow-xl" style={{ backgroundColor: primaryColor }}>
                            <p className="text-[10px] font-bold uppercase text-white/90">Oferta</p>
                            <p className="text-xl font-black text-white leading-none">{formattedPrice}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between text-left overflow-auto">
                <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest truncate block" style={{ color: primaryColor }}>
                        {store?.name}
                    </span>
                    <h3 className="text-xl font-black leading-tight text-zinc-900 uppercase italic line-clamp-2">
                        {headline}
                    </h3>
                    <p className="text-xs font-medium text-zinc-600 line-clamp-3 leading-relaxed">
                        {bodyText}
                    </p>
                </div>
                <div className="pt-4 flex items-end justify-between border-t border-zinc-100 mt-2 shrink-0 gap-2">
                    <div className="text-[9px] text-zinc-400 font-medium max-w-[55%]">
                        {whatsappDisplay && (
                            <div className="flex items-center gap-1 font-bold text-zinc-600 mb-0.5">
                                <Phone className="h-2.5 w-2.5 text-emerald-500 fill-emerald-500" />
                                <span className="truncate">{whatsappDisplay}</span>
                            </div>
                        )}
                        <p className="truncate opacity-70">{store?.address}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-900 px-4 py-2 text-[10px] font-black text-white uppercase tracking-tight flex-1 text-center line-clamp-2">
                        {cta}
                    </div>
                </div>
            </div>
        </div>
    );
}
