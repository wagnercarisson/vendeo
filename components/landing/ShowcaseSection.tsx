"use client";

import React, { useState, useRef, useEffect } from "react";

type NicheKey = "adega" | "boutique" | "market" | "pet" | "pharmacy";

interface NicheData {
  id: NicheKey;
  icon: string;
  label: string;
  name: string;
  location: string;
  phrase: string;
  beforeImg: string;
  afterImg: string;
}

const niches: NicheData[] = [
  {
    id: "adega",
    icon: "🍷",
    label: "Adega",
    name: "Mestre das Geladas",
    location: "Anápolis, GO",
    phrase: "Aqui a sua cerveja sempre está gelada!",
    beforeImg: "/showcase/before-adega.png",
    afterImg: "/showcase/art-adega.png",
  },
  {
    id: "boutique",
    icon: "👗",
    label: "Boutique",
    name: "Boutique Aura Concept",
    location: "Ribeirão Preto, SP",
    phrase: "Onde a elegância encontra a sua melhor versão.",
    beforeImg: "/showcase/before-boutique.png",
    afterImg: "/showcase/art-boutique.png",
  },
  {
    id: "market",
    icon: "🛒",
    label: "Mercado",
    name: "Mercado da Terra",
    location: "Cuiabá, MT",
    phrase: "O frescor do campo selecionado para a sua mesa.",
    beforeImg: "/showcase/before-market.png",
    afterImg: "/showcase/art-market.png",
  },
  {
    id: "pet",
    icon: "🐾",
    label: "Pet Shop",
    name: "Pet Shop Bicho Mimado",
    location: "Blumenau, SC",
    phrase: "Seu bichinho aos cuidados dos melhores profissionais",
    beforeImg: "/showcase/before-pet.png",
    afterImg: "/showcase/art-pet.png",
  },
  {
    id: "pharmacy",
    icon: "💊",
    label: "Farmácia",
    name: "Farmácia Multi Popular",
    location: "Juazeiro do Norte, CE",
    phrase: "Nós cuidamos da sua saúde e da sua economia.",
    beforeImg: "/showcase/before-pharmacy.png",
    afterImg: "/showcase/art-pharmacy.png",
  },
];

function BeforeAfterSlider({ beforeImg, afterImg }: { beforeImg: string; afterImg: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchend", onMouseUp);
    } else {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl select-none bg-emerald-50 shadow-md ring-1 ring-black/5 cursor-ew-resize"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Imagem Pós (Fundo) */}
      <img
        src={afterImg}
        alt="Arte finalizada"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      
      {/* Imagem Antes (Por cima, cortada via clip-path) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImg}
          alt="Foto original do produto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Linha Divisória */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none border border-black/5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/60">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/60 absolute rotate-180">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
      </div>
      
      {/* Tags informativas */}
      <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] md:text-xs font-semibold text-white backdrop-blur-sm pointer-events-none opacity-90">
        Antes
      </div>
      <div className="absolute top-4 right-4 rounded-full bg-vendeo-green px-3 py-1 text-[10px] md:text-xs font-semibold text-white shadow-sm pointer-events-none">
        Depois
      </div>
    </div>
  );
}

export default function ShowcaseSection() {
  const [activeNicheId, setActiveNicheId] = useState<NicheKey>("adega");

  const activeNiche = niches.find((n) => n.id === activeNicheId) || niches[0];

  return (
    <section id="exemplos" className="vendeo-section-glow bg-black/[0.02] py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70 mb-4">
            Veja a Mágica Acontecendo
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            De fotos reais para postagens de cair o queixo.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/70">
            Seja qual for o seu segmento, o Vendeo transforma a foto que você tirou no balcão 
            em uma peça de publicidade profissional. Puxe a barra e descubra:
          </p>
        </div>

        {/* Niche Selector */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 md:gap-4">
          {niches.map((niche) => {
            const isActive = niche.id === activeNicheId;
            return (
              <button
                key={niche.id}
                onClick={() => setActiveNicheId(niche.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-vendeo-green text-white shadow-md scale-105"
                    : "bg-white text-black/70 hover:bg-black/5 border border-black/10"
                }`}
              >
                <span className="text-lg">{niche.icon}</span>
                <span>{niche.label}</span>
              </button>
            );
          })}
        </div>

        {/* Layout do Vídeo + Slider */}
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] items-center max-w-5xl mx-auto">
          
          {/* Vídeo Demo */}
          <div className="flex flex-col items-center">
            <div className="relative w-[280px] md:w-[320px] rounded-[2.5rem] bg-black p-3 shadow-2xl ring-1 ring-black/10">
              <div className="absolute top-0 left-1/2 w-32 h-6 -translate-x-1/2 rounded-b-3xl bg-black z-20"></div>
              <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900 aspect-[9/19.5]">
                <video
                  src="/showcase/vendeo-magic.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="mt-6 text-center text-sm font-medium text-black/60 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vendeo-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-vendeo-green"></span>
              </span>
              Processo real gravado em tela
            </div>
          </div>

          {/* Slider e Painel Dinâmico */}
          <div className="flex flex-col gap-6">
            
            <div key={activeNiche.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BeforeAfterSlider 
                beforeImg={activeNiche.beforeImg} 
                afterImg={activeNiche.afterImg} 
              />
            </div>

            {/* DynamicText Panel */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-vendeo-green mb-1 uppercase tracking-wider">
                  Loja Simulada
                </div>
                <div className="text-lg font-bold text-black flex items-center gap-2">
                  <span>{activeNiche.name}</span>
                  <span className="text-sm font-normal text-black/40">|</span>
                  <span className="text-sm font-medium text-black/60">{activeNiche.location}</span>
                </div>
                <div className="mt-2 text-sm italic text-black/70">
                  &quot;{activeNiche.phrase}&quot;
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
