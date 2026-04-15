"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { CampaignObjective } from "@/lib/constants/strategy";

type Idea = {
    icon: string;
    bgColor: string;
    title: string;
    description: string;
    params: {
        type: "product" | "service" | "message";
        objective: CampaignObjective;
        audience: string;
        positioning: string;
    };
};

const GLOBAL_IDEAS: Idea[] = [
    {
        icon: "⚡",
        bgColor: "bg-red-100",
        title: "Promoção Relâmpago",
        description: "Crie senso de urgência para vender rápido hoje.",
        params: {
            type: "product",
            objective: "queima",
            audience: "geral",
            positioning: "popular",
        }
    },
    {
        icon: "⭐",
        bgColor: "bg-purple-100",
        title: "Lançamento de Novidade",
        description: "Apresente um novo produto que acabou de chegar.",
        params: {
            type: "product",
            objective: "novidade",
            audience: "geral",
            positioning: "medio",
        }
    },
    {
        icon: "🎁",
        bgColor: "bg-blue-100",
        title: "Brinde Especial",
        description: "Ofereça um mimo para compras acima de um valor.",
        params: {
            type: "product",
            objective: "promocao",
            audience: "mulheres",
            positioning: "premium",
        }
    },
    {
        icon: "🔥",
        bgColor: "bg-orange-100",
        title: "Últimas Unidades",
        description: "Crie escassez para produtos com estoque baixo.",
        params: {
            type: "product",
            objective: "queima",
            audience: "economico",
            positioning: "popular",
        }
    }
];

const SEGMENT_IDEAS: Record<string, Idea[]> = {
    "Mercado": [
        {
            icon: "🍻",
            bgColor: "bg-emerald-100",
            title: "Combo Churrasco",
            description: "Sugira os itens essenciais para o fim de semana.",
            params: {
                type: "product",
                objective: "combo",
                audience: "familia",
                positioning: "medio",
            }
        },
        {
            icon: "🧼",
            bgColor: "bg-blue-100",
            title: "Dia da Limpeza",
            description: "Ofertas em produtos de higiene e limpeza.",
            params: {
                type: "product",
                objective: "promocao",
                audience: "maes_pais",
                positioning: "economico",
            }
        }
    ],
    "Moda": [
        {
            icon: "👗",
            bgColor: "bg-pink-100",
            title: "Look do Dia",
            description: "Combine peças para inspirar suas clientes.",
            params: {
                type: "product",
                objective: "novidade",
                audience: "mulheres",
                positioning: "medio",
            }
        },
        {
            icon: "👠",
            bgColor: "bg-slate-100",
            title: "Coleção Premium",
            description: "Destaque as peças mais exclusivas da loja.",
            params: {
                type: "product",
                objective: "novidade",
                audience: "premium_exigente",
                positioning: "premium",
            }
        }
    ],
    "Bebidas": [
        {
            icon: "🍷",
            bgColor: "bg-red-100",
            title: "Seleção de Vinhos",
            description: "Destaque os rótulos perfeitos para o jantar.",
            params: {
                type: "product",
                objective: "novidade",
                audience: "premium_exigente",
                positioning: "premium",
            }
        },
        {
            icon: "🥤",
            bgColor: "bg-orange-100",
            title: "Refresco de Verão",
            description: "Ideal para dias quentes na sua cidade.",
            params: {
                type: "product",
                objective: "promocao",
                audience: "geral",
                positioning: "popular",
            }
        },
        {
            icon: "🍺",
            bgColor: "bg-yellow-100",
            title: "Happy Hour em Casa",
            description: "Combos de cervejas especiais para o fim do dia.",
            params: {
                type: "product",
                objective: "combo",
                audience: "homens",
                positioning: "jovem",
            }
        }
    ]
};

export function InspiredIdeas({ segment }: { segment?: string | null }) {
    const [mounted, setMounted] = useState(false);
    const [selectedIdeas, setSelectedIdeas] = useState<Idea[]>([]);

    useEffect(() => {
        setMounted(true);
        // Normalizar segmento para busca case-insensitive e parcial
        const normalizedSegment = (segment || "").toLowerCase().trim();
        
        // Tenta encontrar a chave que contém o segmento ou é contida por ele
        const segmentKey = Object.keys(SEGMENT_IDEAS).find(key => 
            key.toLowerCase() === normalizedSegment || 
            normalizedSegment.includes(key.toLowerCase()) ||
            key.toLowerCase().includes(normalizedSegment)
        );
        
        const segmentIdeas = segmentKey ? SEGMENT_IDEAS[segmentKey] : [];
        
        // Combinar com globais e randomizar
        setSelectedIdeas([...GLOBAL_IDEAS, ...segmentIdeas]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
        );
    }, [segment]);

    if (!mounted) {
        return (
            <div className="pt-6 border-t border-slate-200/60 font-sans">
                <h2 className="mb-5 text-lg font-semibold tracking-tight text-vendeo-text flex items-center gap-2">
                    <span className="text-xl">✨</span> Ideias para você se inspirar
                </h2>
                <div className="grid gap-6 md:grid-cols-3 min-h-[200px]">
                </div>
            </div>
        );
    }

    return (
        <div className="pt-6 border-t border-slate-200/60 font-sans">
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-vendeo-text flex items-center gap-2">
                <span className="text-xl">✨</span> Ideias para você se inspirar
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
                {selectedIdeas.map((idea, idx) => {
                    const queryParams = new URLSearchParams({
                        type: idea.params.type,
                        objective: idea.params.objective,
                        audience: idea.params.audience,
                        positioning: idea.params.positioning,
                        idea_title: idea.title
                    }).toString();

                    return (
                        <div key={idx} className="rounded-2xl border bg-white p-6 shadow-soft transition-all hover:shadow-md hover:-translate-y-[1px] flex flex-col group">
                            <div className={[
                                "mb-4 flex h-10 w-10 items-center justify-center rounded-lg group-hover:scale-110 transition-transform",
                                idea.bgColor
                            ].join(" ")}>
                                {idea.icon}
                            </div>
                            <h3 className="font-semibold text-vendeo-text">
                                {idea.title}
                            </h3>
                            <p className="mt-2 text-sm text-vendeo-muted">
                                {idea.description}
                            </p>
                            <Link
                                href={`/dashboard/campaigns/new?${queryParams}`}
                                className="mt-4 inline-flex items-center text-emerald-700 hover:text-emerald-800 font-semibold"
                            >
                                Criar agora <span className="ml-1">→</span>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
