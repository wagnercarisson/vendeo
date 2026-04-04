"use client";

import { Upload, ImageIcon, X, Loader2 } from "lucide-react";

interface StoreIdentityFormProps {
  name: string;
  setName: (v: string) => void;
  segmentChoice: string;
  setSegmentChoice: (v: string) => void;
  mainSegmentCustom: string;
  setMainSegmentCustom: (v: string) => void;
  toneChoice: string;
  setToneChoice: (v: string) => void;
  toneCustom: string;
  setToneCustom: (v: string) => void;
  brandPositioning: string;
  setBrandPositioning: (v: string) => void;
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  secondaryColor: string;
  setSecondaryColor: (v: string) => void;
  logoPreviewUrl: string;
  uploadingLogo: boolean;
  uploadProgress: number;
  logoErrorMsg: string | null;
  setLogoErrorMsg: (v: string | null) => void;
  onLogoFileSelected: (file: File | null) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dragOver: boolean;
  SEGMENT_OPTIONS: string[];
  TONE_OPTIONS: string[];
}

export function StoreIdentityForm({
  name,
  setName,
  segmentChoice,
  setSegmentChoice,
  mainSegmentCustom,
  setMainSegmentCustom,
  toneChoice,
  setToneChoice,
  toneCustom,
  setToneCustom,
  brandPositioning,
  setBrandPositioning,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  logoPreviewUrl,
  uploadingLogo,
  uploadProgress,
  logoErrorMsg,
  setLogoErrorMsg,
  onLogoFileSelected,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  dragOver,
  SEGMENT_OPTIONS,
  TONE_OPTIONS,
}: StoreIdentityFormProps) {
  return (
    <div className="grid gap-8">
      {/* Nome e Segmento */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1 sm:col-span-2">
          <label className="text-sm font-medium">Nome da loja *</label>
          <input
            className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Mercado Central"
            required
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium text-zinc-700">Ramo de atividade</label>
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            value={segmentChoice}
            onChange={(e) => setSegmentChoice(e.target.value)}
          >
            <option value="">Selecione...</option>
            {SEGMENT_OPTIONS.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>

        {segmentChoice === "Outro…" && (
          <div className="grid gap-1">
            <label className="text-sm font-medium text-zinc-700">Qual o ramo?</label>
            <input
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={mainSegmentCustom}
              onChange={(e) => setMainSegmentCustom(e.target.value)}
              placeholder="Ex.: Loja de Tintas"
            />
          </div>
        )}
      </div>

      <hr className="border-zinc-100" />

      {/* Logo e Cores */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Logo da loja</label>
          <div
            onClick={() => !uploadingLogo && fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 min-h-[140px] flex flex-col items-center justify-center p-4 
              ${dragOver ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/50"}
              ${uploadingLogo ? "pointer-events-none opacity-80" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onLogoFileSelected(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {uploadingLogo ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium text-zinc-600">Enviando... {uploadProgress}%</span>
              </div>
            ) : logoPreviewUrl ? (
              <div className="relative h-24 w-24">
                <img src={logoPreviewUrl} alt="Logo" className="h-full w-full object-contain" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Upload className="h-5 w-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">Clique ou arraste a logo</span>
              </div>
            )}
          </div>
          {logoErrorMsg && <p className="mt-1 text-xs text-red-500">{logoErrorMsg}</p>}
        </div>

        <div className="grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Cor Primária</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-11 w-20 cursor-pointer rounded-lg border border-zinc-200 p-1"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <input
                className="h-11 w-[120px] rounded-xl border border-zinc-200 px-3 text-sm"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                maxLength={7}
              />
            </div>
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Cor Secundária</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-11 w-20 cursor-pointer rounded-lg border border-zinc-200 p-1"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
              <input
                className="h-11 w-[120px] rounded-xl border border-zinc-200 px-3 text-sm"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-zinc-100" />

      {/* Tom de Voz e Posicionamento */}
      <div className="grid items-start gap-6 sm:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm font-medium text-zinc-700">Tom de voz</label>
          <div className="grid gap-2">
            <select
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={toneChoice}
              onChange={(e) => setToneChoice(e.target.value)}
            >
              <option value="">Selecione...</option>
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {toneChoice === "Outro…" && (
              <input
                className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                value={toneCustom}
                onChange={(e) => setToneCustom(e.target.value)}
                placeholder="Descreva o tom..."
              />
            )}
            {/* Espaçador para manter altura se não houver 'Outro...' */}
            {toneChoice !== "Outro…" && <div className="h-11 hidden sm:block" />}
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Posicionamento e Diferencial</label>
          <textarea
            className="min-h-[110px] sm:min-h-[116px] resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            value={brandPositioning}
            onChange={(e) => setBrandPositioning(e.target.value)}
            placeholder="Ex.: A maior variedade de tintas de Brusque com entrega rápida."
          />
        </div>
      </div>
    </div>
  );
}
