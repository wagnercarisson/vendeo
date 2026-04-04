"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, MapPin, Phone, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, CircleOff } from "lucide-react";
import { StoreBranch } from "@/lib/domain/stores/types";

interface StoreLocationsFormProps {
  address: string;
  setAddress: (v: string) => void;
  neighborhood: string;
  setNeighborhood: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  stateUf: string;
  setStateUf: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  instagram: string;
  setInstagram: (v: string) => void;
  branches: StoreBranch[];
  setBranches: (v: StoreBranch[]) => void;
  UF_OPTIONS: string[];
  formatBRPhone: (v: string) => string;
  formatBRCell: (v: string) => string;
}

export function StoreLocationsForm({
  address,
  setAddress,
  neighborhood,
  setNeighborhood,
  city,
  setCity,
  stateUf,
  setStateUf,
  phone,
  setPhone,
  whatsapp,
  setWhatsapp,
  instagram,
  setInstagram,
  branches,
  setBranches,
  UF_OPTIONS,
  formatBRPhone,
  formatBRCell,
}: StoreLocationsFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedBranches = useMemo(() => {
    return [...branches].sort((a, b) => {
      // Ativas primeiro
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;
      // Depois ordem alfabética por nome
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [branches]);

  const addBranch = () => {
    const newId = crypto.randomUUID();
    const newBranch: StoreBranch = {
      id: newId,
      name: "",
      address: "",
      neighborhood: "",
      city: "",
      state: "",
      whatsapp: "",
      is_main: false,
      is_active: true,
    };
    setBranches([...branches, newBranch]);
    setExpandedId(newId);
  };

  const removeBranch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBranches(branches.filter((b) => b.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleBranch = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const updateBranch = (id: string, updates: Partial<StoreBranch>) => {
    setBranches(
      branches.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const getBranchStatus = (b: StoreBranch) => {
    if (!b.is_active) return "inactive";
    if (b.name && b.address && b.city && b.state) return "complete";
    return "incomplete";
  };

  return (
    <div className="grid gap-8">
      {/* Endereço Principal (Matriz) */}
      <section className="grid gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 uppercase tracking-tight">
          <MapPin className="h-4 w-4 text-emerald-600" />
          Endereço Principal (Matriz)
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1 sm:col-span-3">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rua e Número *</label>
            <input
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex.: Rua do Comércio, 92"
              required
            />
          </div>

          <div className="grid gap-1 sm:col-span-3">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cidade *</label>
            <input
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex.: São Paulo"
              required
            />
          </div>

          <div className="grid gap-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bairro *</label>
            <input
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex.: Centro"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Estado (UF) *</label>
            <select
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={stateUf}
              onChange={(e) => setStateUf(e.target.value)}
              required
            >
              <option value="">UF</option>
              {UF_OPTIONS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <hr className="border-zinc-100" />

      {/* Contatos Sociais */}
      <section className="grid gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 uppercase tracking-tight">
          <Phone className="h-4 w-4 text-emerald-600" />
          Contatos e Redes (Matriz)
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">WhatsApp *</label>
            <input
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatBRCell(e.target.value))}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Telefone (Fixo)</label>
            <input
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              value={phone}
              onChange={(e) => setPhone(formatBRPhone(e.target.value))}
              placeholder="(00) 0000-0000"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Instagram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">@</span>
              <input
                className="h-11 w-full rounded-xl border border-zinc-200 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                value={instagram.replace("@", "")}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="minhaloja"
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-zinc-100" />

      {/* Filiais (Acordeão) */}
      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 uppercase tracking-tight">
            <Plus className="h-4 w-4 text-emerald-600" />
            Unidades e Filiais
          </div>
          <button
            type="button"
            onClick={addBranch}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 uppercase tracking-wider"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Unidade
          </button>
        </div>

        {branches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center bg-zinc-50/30">
            <p className="text-sm text-zinc-500 font-medium">Nenhuma filial cadastrada.</p>
            <p className="mt-1 text-xs text-zinc-400">Clique em "Adicionar Unidade" para configurar suas filiais.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedBranches.map((branch) => {
              const isOpen = expandedId === branch.id;
              const status = getBranchStatus(branch);
              
              return (
                <div 
                  key={branch.id} 
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen ? "border-emerald-200 bg-white ring-4 ring-emerald-50/50 shadow-sm" : "border-zinc-200 bg-zinc-50/40 hover:border-zinc-300"
                  }`}
                >
                  {/* Cabeçalho do Acordeão */}
                  <div 
                    onClick={() => toggleBranch(branch.id)}
                    className="flex cursor-pointer items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {status === "inactive" ? (
                        <CircleOff className="h-4 w-4 text-zinc-400" />
                      ) : status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className={`text-sm font-semibold ${branch.is_active ? "text-zinc-900" : "text-zinc-400 line-through"}`}>
                        {branch.name || "Nova Unidade (sem nome)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => removeBranch(branch.id, e)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                    </div>
                  </div>

                  {/* Conteúdo Expansível */}
                  {isOpen && (
                    <div className="border-t border-zinc-100 p-6 pt-5 bg-white">
                      <div className="grid gap-6">
                        {/* 1. Nome e Status */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                          <div className="flex-1 grid gap-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Identificação da Unidade *</label>
                            <input
                              className="h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                              value={branch.name}
                              onChange={(e) => updateBranch(branch.id, { name: e.target.value })}
                              placeholder="Ex: Filial Centro, Loja 02, Prime..."
                            />
                          </div>
                          <div className="flex items-center gap-2 pb-2">
                             <input
                               type="checkbox"
                               id={`active-${branch.id}`}
                               checked={branch.is_active}
                               onChange={(e) => updateBranch(branch.id, { is_active: e.target.checked })}
                               className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                             />
                             <label htmlFor={`active-${branch.id}`} className="text-xs font-semibold text-zinc-600">Unidade Ativa</label>
                          </div>
                        </div>

                        {/* 2. Endereço Grid */}
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="grid gap-1 sm:col-span-3">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rua e Número</label>
                            <input
                              className="h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                              value={branch.address || ""}
                              onChange={(e) => updateBranch(branch.id, { address: e.target.value })}
                            />
                          </div>

                          <div className="grid gap-1 sm:col-span-3">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cidade</label>
                            <input
                              className="h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                              value={branch.city || ""}
                              onChange={(e) => updateBranch(branch.id, { city: e.target.value })}
                            />
                          </div>

                          <div className="grid gap-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bairro</label>
                            <input
                              className="h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                              value={branch.neighborhood || ""}
                              onChange={(e) => updateBranch(branch.id, { neighborhood: e.target.value })}
                            />
                          </div>

                          <div className="grid gap-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">UF</label>
                            <select
                              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                              value={branch.state || ""}
                              onChange={(e) => updateBranch(branch.id, { state: e.target.value })}
                            >
                              <option value="">UF</option>
                              {UF_OPTIONS.map((uf) => (
                                <option key={uf} value={uf}>{uf}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 3. Contato Regional */}
                        <div className="grid gap-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">WhatsApp Regional (opcional)</label>
                          <input
                            className="h-10 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                            value={branch.whatsapp || ""}
                            onChange={(e) => updateBranch(branch.id, { whatsapp: formatBRCell(e.target.value) })}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
