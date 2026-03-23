import { useState } from "react";
import { WeeklyPlanItem, Campaign } from "./types";
import { AlertCircle, X, ChevronRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";

interface Props {
  item: WeeklyPlanItem;
  campaign: Campaign;
  onClose: () => void;
  onConfirm: () => void;
  onUpdated: () => void;
}

export function ValidationPopupModal({ item, campaign, onClose, onConfirm, onUpdated }: Props) {
  const [saving, setSaving] = useState(false);
  
  // Local state for missing essential fields
  const [price, setPrice] = useState(campaign.price?.toString() || "");

  // Example check: If the objective implies sales/promotion, price is highly recommended.
  const isSaleObjective = String(campaign.objective || "").toLowerCase().includes("vender") || 
                          String(campaign.objective || "").toLowerCase().includes("promoção");

  const missingPrice = isSaleObjective && !price.trim();
  const missingName = !(campaign.product_name || "").trim();
  const missingAudience = !(campaign.audience || "").trim();
  
  const hasCriticalWarnings = missingPrice || missingName || missingAudience;

  async function handleSaveAndProceed() {
     if (hasCriticalWarnings) return;
     
     setSaving(true);
     // Only update if price changed
     const numericPrice = parseFloat(price.replace(/,/g, ".") || "0");
     const priceChanged = !isNaN(numericPrice) && numericPrice !== campaign.price;

     if (priceChanged) {
        try {
           const { error } = await supabase
             .from("campaigns")
             .update({ price: numericPrice })
             .eq("id", campaign.id);
             
           if (error) throw new Error(error.message);
           onUpdated(); // triggers parent reload
        } catch (e: any) {
           console.error("Erro ao salvar preço", e);
           alert("Erro ao salvar o preço: " + e?.message);
           setSaving(false);
           return;
        }
     }
     
     setSaving(false);
     onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <MotionWrapper className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-black/5 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <AlertCircle className="h-5 w-5" />
             </div>
             <div>
                <h2 className="font-semibold text-slate-900">Revisão Necessária</h2>
                <p className="text-xs text-slate-500">Antes de gerar conteúdo para ({campaign.product_name || "Sem Nome"})</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
           <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-800 leading-relaxed font-medium mb-2">
                 Para a IA gerar um texto persuasivo perfeito, precisamos garantir que todos os dados essenciais estão preenchidos.
              </p>
              <ul className="text-xs text-orange-700/80 space-y-1 list-disc pl-4">
                <li>O objetivo detectado é: <strong>{campaign.objective}</strong></li>
              </ul>
           </div>

           <div className="space-y-4">
              <div className="flex items-start justify-between">
                 <div>
                    <label className="text-sm font-semibold text-slate-900 block">Preço do Produto/Oferta</label>
                    <p className="text-xs text-slate-500">Útil para chamadas de vendas fortes.</p>
                 </div>
                 {missingPrice ? (
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Obrigatório</span>
                 ) : (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">OK</span>
                 )}
              </div>
              <input 
                 type="number"
                 step="0.01"
                 value={price}
                 onChange={(e) => setPrice(e.target.value)}
                 className={`w-full rounded-xl border p-3 text-sm outline-none transition-all ${
                    missingPrice ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 bg-slate-50 focus:border-orange-500 focus:bg-white"
                 }`}
                 placeholder="0.00"
              />
              {missingPrice && <p className="text-xs text-red-500 font-medium">Como o foco é vender, o preço não pode estar vazio.</p>}
           </div>

           {/* Warnings for global missing data */}
           {(missingName || missingAudience) && (
             <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Erros Críticos da Campanha</p>
                {missingName && <p className="text-xs text-red-600 flex items-center gap-1"><X className="w-3 h-3"/> Nome do Produto está vazio.</p>}
                {missingAudience && <p className="text-xs text-red-600 flex items-center gap-1"><X className="w-3 h-3"/> Público-Alvo está vazio.</p>}
                <p className="text-xs text-red-700 font-medium mt-2 pt-2 border-t border-red-200">Por favor, feche e edite a campanha no passo anterior para corrigir.</p>
             </div>
           )}

        </div>

        <div className="flex items-center justify-end gap-3 border-t border-black/5 bg-slate-50/50 p-6">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSaveAndProceed}
            disabled={hasCriticalWarnings || saving}
            className="flex items-center gap-2 rounded-xl bg-[#0B2E22] px-6 py-2.5 text-sm font-semibold text-white shadow-premium transition hover:bg-[#0F3D2E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Salvando..." : (
               <>
                  Confirmar e Gerar <ChevronRight className="h-4 w-4" />
               </>
            )}
          </button>
        </div>
      </MotionWrapper>
    </div>
  );
}
