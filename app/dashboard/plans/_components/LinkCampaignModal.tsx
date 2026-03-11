import { useState, useEffect } from "react";
import { Campaign, WeeklyPlanItem } from "./types";
import { X, Plus, Search, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  item: WeeklyPlanItem;
  storeId: string;
  onClose: () => void;
  onLinked: () => void;
}

export function LinkCampaignModal({ item, storeId, onClose, onLinked }: Props) {
  const [tab, setTab] = useState<"new" | "existing">("new");
  
  // Fast Creation State
  const [productName, setProductName] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("Vender mais");
  const [isSaving, setIsSaving] = useState(false);

  // Existing Campaigns State
  const [existing, setExisting] = useState<Campaign[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  useEffect(() => {
    if (tab === "existing") {
      loadExisting();
    }
  }, [tab]);

  async function loadExisting() {
    setIsLoadingExisting(true);
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(20);
      
    setExisting((data as Campaign[]) || []);
    setIsLoadingExisting(false);
  }

  async function handleFastCreate() {
    if (!productName.trim() || !audience.trim() || !objective.trim()) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    
    setIsSaving(true);
    try {
      // 1. Create the campaign
      const { data: campData, error: campErr } = await supabase
        .from("campaigns")
        .insert({
          store_id: storeId,
          product_name: productName.trim(),
          audience: audience.trim(),
          objective: objective.trim(),
        })
        .select("id")
        .single();

      if (campErr || !campData) throw new Error("Erro ao criar campanha");

      // 2. Link it to the plan item
      const { error: linkErr } = await supabase
        .from("weekly_plan_items")
        .update({ campaign_id: campData.id })
        .eq("id", item.id);
        
      if (linkErr) throw new Error("Erro ao vincular");

      onLinked();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLinkExisting(campaignId: string) {
    setIsSaving(true);
    try {
      const { error: linkErr } = await supabase
        .from("weekly_plan_items")
        .update({ campaign_id: campaignId })
        .eq("id", item.id);
        
      if (linkErr) throw new Error("Erro ao vincular");
      onLinked();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[600px] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5 bg-slate-50">
           <div>
              <h3 className="text-lg font-semibold text-slate-900">Adicionar Produto</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sugestão da IA: {item.theme}</p>
           </div>
           <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
              <X className="h-5 w-5" />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
           <button 
             onClick={() => setTab("new")}
             className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${tab === "new" ? "border-emerald-500 text-emerald-700 bg-emerald-50/30" : "border-transparent text-slate-500 hover:bg-slate-50"}`}
           >
             Criação Rápida
           </button>
           <button 
             onClick={() => setTab("existing")}
             className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${tab === "existing" ? "border-emerald-500 text-emerald-700 bg-emerald-50/30" : "border-transparent text-slate-500 hover:bg-slate-50"}`}
           >
             Vincular Existente
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
           {tab === "new" ? (
             <div className="space-y-4">
                <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 mb-2">
                   <p className="text-xs text-blue-800 leading-relaxed">
                     Esta é uma criação rápida. Um registro de campanha será salvo na sua conta com estes dados básicos para que a IA possa gerar os textos.
                   </p>
                </div>

                <div>
                   <label className="mb-1 block text-sm font-semibold text-slate-900">Nome do Produto *</label>
                   <input 
                     value={productName}
                     onChange={e => setProductName(e.target.value)}
                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                     placeholder="Ex: Cerveja Artesanal IPA 600ml"
                     autoFocus
                   />
                </div>
                <div>
                   <label className="mb-1 block text-sm font-semibold text-slate-900">Público-Alvo *</label>
                   <input 
                     value={audience}
                     onChange={e => setAudience(e.target.value)}
                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                     placeholder="Ex: Jovens de 25-40 anos que gostam de churrasco"
                   />
                </div>
                <div>
                   <label className="mb-1 block text-sm font-semibold text-slate-900">Objetivo Principal *</label>
                   <input 
                     value={objective}
                     onChange={e => setObjective(e.target.value)}
                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                     placeholder="Ex: Atrair clientes para o bar no final de semana"
                   />
                </div>
             </div>
           ) : (
             <div className="space-y-3">
                {isLoadingExisting ? (
                  <p className="text-sm text-slate-500 text-center py-10">Carregando campanhas...</p>
                ) : existing.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10">Nenhuma campanha encontrada para esta loja.</p>
                ) : (
                  existing.map(camp => {
                    const isComplete = camp.product_name && camp.audience && camp.objective;
                    return (
                      <div key={camp.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition group cursor-pointer" onClick={() => handleLinkExisting(camp.id)}>
                         <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">{camp.product_name || "Campanha sem nome"}</p>
                            <p className="text-xs text-slate-500 mt-0.5 max-w-[280px] truncate">{camp.objective || "Sem objetivo definido"}</p>
                         </div>
                         {!isComplete ? (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">Incompleta</span>
                         ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                         )}
                      </div>
                    )
                  })
                )}
             </div>
           )}
        </div>

        {/* Footer */}
        {tab === "new" && (
          <div className="border-t p-5 bg-slate-50 flex justify-end">
             <button
               onClick={handleFastCreate}
               disabled={isSaving || !productName.trim() || !audience.trim() || !objective.trim()}
               className="flex items-center gap-2 rounded-xl bg-[#0B2E22] px-6 py-2.5 text-sm font-medium text-white shadow-premium transition hover:bg-[#0F3D2E] disabled:opacity-50"
             >
               {isSaving ? "Salvando..." : "Salvar e Vincular"}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
