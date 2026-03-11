type ReelsPreviewCardProps = {
    hook?: string;
    script?: string;
    shotlist?: {
        scene: number;
        camera: string;
        action: string;
        dialogue: string;
    }[];
    audioSuggestion?: string;
    durationSeconds?: number;
    onScreenText?: string[];
    caption?: string;
    cta?: string;
    hashtags?: string;
};

export function ReelsPreviewCard({
    hook,
    script,
    shotlist,
    audioSuggestion,
    durationSeconds,
    onScreenText,
    caption,
    cta,
    hashtags,
}: ReelsPreviewCardProps) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5">
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-zinc-900">🎬 Roteiro de Reels (Wow)</h3>
            </div>

            <div className="space-y-5 text-sm text-zinc-700">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            Hook (Gancho Vital)
                        </span>
                        <p className="mt-1 font-black text-zinc-900 leading-tight italic">{hook || "—"}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Foco do Vídeo
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                             <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-medium text-zinc-600">
                                 ⏱️ {durationSeconds ? `${durationSeconds}s` : "—"}
                             </span>
                             <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-medium text-zinc-600">
                                 🎵 {audioSuggestion || "Áudio dinâmico"}
                             </span>
                        </div>
                    </div>
                </div>

                {onScreenText && onScreenText.length > 0 && (
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Texto na Tela (Overlays)
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                            {onScreenText.map((text, i) => (
                                <span key={i} className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase italic tracking-tighter">
                                    "{text}"
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Roteiro Sugerido
                    </span>
                    <p className="mt-1 leading-relaxed whitespace-pre-line text-zinc-800 bg-white p-4 rounded-xl border border-zinc-100 italic">
                        {script || "—"}
                    </p>
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Cenas Sugeridas (Shotlist)
                    </span>
                    {shotlist?.length ? (
                        <div className="mt-2 space-y-3">
                            {shotlist.map((item, index) => (
                                <div key={index} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm flex gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                                        {item.scene}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase text-emerald-600 tracking-wide">
                                            {item.camera}
                                        </div>
                                        <p className="text-xs text-zinc-800">
                                            <span className="font-semibold">Ação:</span> {item.action}
                                        </p>
                                        <p className="text-xs italic text-zinc-500">
                                            "{item.dialogue}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-1">—</p>
                    )}
                </div>

                <div className="space-y-3 border-t border-zinc-200 pt-4">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Legenda do Reels
                        </span>
                        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-zinc-600">{caption || "—"}</p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Hashtags
                            </span>
                            <p className="mt-0.5 text-[10px] text-zinc-400">{hashtags || "#vendeo"}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-100">
                            <span className="text-[9px] font-bold uppercase text-emerald-600 block leading-none mb-1">CTA</span>
                            <p className="text-[10px] font-black text-emerald-700 uppercase leading-none">{cta || "Ver Loja"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}