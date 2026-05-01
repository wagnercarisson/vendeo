"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useScoreCalculation } from "./useScoreCalculation";

export type IntelligenceSuccessfulPastCta = {
  cta: string;
  context: string;
  approval_speed_seconds?: number | null;
};

export type IntelligenceContext = {
  schema_version?: string;
  brand_voice?: "formal" | "informal" | "technical" | "playful" | null;
  target_audience?: string;
  seasonal_peaks?: string[];
  main_differentiation?: string;
  top_products?: string[];
  price_positioning?: "economic" | "medium" | "premium" | "luxury" | null;
  average_ticket_brl?: number | null;
  competitors?: string[];
  unique_selling_proposition?: {
    primary_usp?: string;
    supporting_points?: string[];
    proof_elements?: string[];
  };
  customer_pain_points?: string[];
  conversion_triggers?: {
    urgency_preference?: number;
    scarcity_comfortable?: number;
    social_proof_available?: boolean;
    guarantee_offered?: boolean;
  };
  successful_past_ctas?: IntelligenceSuccessfulPastCta[];
  local_events_calendar?: string[];
  language_specifics?: {
    uses_regional_slang?: boolean;
    formality_level?:
      | "very_formal"
      | "formal"
      | "neutral"
      | "casual"
      | "very_casual";
    emoji_comfort?: number;
    max_exclamations_per_copy?: number;
  };
  copy_length_preferences?: {
    headline_max_words?: number;
    body_max_words?: number;
    prefers_brevity?: boolean;
  };
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLoadedContext(value: unknown): IntelligenceContext {
  if (!isPlainObject(value)) {
    return {};
  }

  return value as IntelligenceContext;
}

function createSignature(context: IntelligenceContext) {
  return JSON.stringify(context);
}

function setNestedValue<T extends Record<string, unknown>>(
  source: T,
  path: string,
  value: unknown
) {
  const keys = path.split(".");
  const next = { ...source } as Record<string, unknown>;
  let cursor: Record<string, unknown> = next;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    const existing = cursor[key];
    const branch = isPlainObject(existing) ? { ...existing } : {};
    cursor[key] = branch;
    cursor = branch;
  }

  cursor[keys[keys.length - 1]] = value;
  return next as T;
}

export function validateIntelligenceContext(context: IntelligenceContext) {
  const errors: Record<string, string> = {};

  if ((context.target_audience ?? "").length > 200) {
    errors.target_audience = "Máximo 200 caracteres";
  }

  if ((context.main_differentiation ?? "").length > 300) {
    errors.main_differentiation = "Máximo 300 caracteres";
  }

  if ((context.unique_selling_proposition?.primary_usp ?? "").length > 200) {
    errors["unique_selling_proposition.primary_usp"] = "Máximo 200 caracteres";
  }

  if ((context.average_ticket_brl ?? 0) < 0) {
    errors.average_ticket_brl = "O valor deve ser maior ou igual a 0";
  }

  if ((context.language_specifics?.max_exclamations_per_copy ?? 0) < 0) {
    errors["language_specifics.max_exclamations_per_copy"] = "O valor deve ser maior ou igual a 0";
  }

  if ((context.language_specifics?.max_exclamations_per_copy ?? 0) > 5) {
    errors["language_specifics.max_exclamations_per_copy"] = "Máximo 5 exclamações por copy";
  }

  if ((context.copy_length_preferences?.headline_max_words ?? 0) < 0) {
    errors["copy_length_preferences.headline_max_words"] = "O valor deve ser maior ou igual a 0";
  }

  if ((context.copy_length_preferences?.body_max_words ?? 0) < 0) {
    errors["copy_length_preferences.body_max_words"] = "O valor deve ser maior ou igual a 0";
  }

  const successfulPastCtas = context.successful_past_ctas ?? [];

  for (let index = 0; index < successfulPastCtas.length; index += 1) {
    const item = successfulPastCtas[index];

    if ((item.approval_speed_seconds ?? 0) < 0) {
      errors[`successful_past_ctas.${index}.approval_speed_seconds`] =
        "O valor deve ser maior ou igual a 0";
    }
  }

  return errors;
}

export function useIntelligenceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string>("");
  const [activeTab, setActiveTab] = useState(0);
  const [context, setContext] = useState<IntelligenceContext>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState(
    "Preencha os campos e troque de aba para salvar automaticamente."
  );

  const scoreSummary = useScoreCalculation(context as Record<string, unknown>);
  const validationErrors = useMemo(() => validateIntelligenceContext(context), [context]);
  const lastSavedSignatureRef = useRef(createSignature({}));
  const didHydrateTabRef = useRef(false);
  const contextRef = useRef(context);
  const signatureRef = useRef(createSignature(context));
  const filledFieldsRef = useRef(scoreSummary.filledFields);

  useEffect(() => {
    contextRef.current = context;
    signatureRef.current = createSignature(context);
    filledFieldsRef.current = scoreSummary.filledFields;
  }, [context, scoreSummary.filledFields]);

  useEffect(() => {
    let cancelled = false;

    async function loadIntelligence() {
      setLoading(true);
      setLoadError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        router.push("/login?mode=login&next=%2Fdashboard%2Fstore%2Fintelligence");
        return;
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (storeError) {
        setLoadError(storeError.message);
        setLoading(false);
        return;
      }

      if (!store?.id) {
        router.push("/dashboard/store");
        return;
      }

      setStoreId(store.id);

      const { data: intelligence, error: intelligenceError } = await supabase
        .from("store_intelligence")
        .select("context")
        .eq("store_id", store.id)
        .maybeSingle();

      if (cancelled) return;

      if (intelligenceError) {
        setLoadError(intelligenceError.message);
        setLoading(false);
        return;
      }

      const nextContext = normalizeLoadedContext(intelligence?.context);
      setContext(nextContext);
      lastSavedSignatureRef.current = createSignature(nextContext);
      setSaveStatus("idle");
      setSaveMessage(
        Object.keys(nextContext).length > 0
          ? "Dados carregados. Troque de aba para salvar novas alterações."
          : "Preencha os campos e troque de aba para salvar automaticamente."
      );
      setLoading(false);
    }

    void loadIntelligence();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveChanges(snapshot?: IntelligenceContext, signature?: string) {
    const payload = snapshot ?? contextRef.current;
    const payloadSignature = signature ?? createSignature(payload);
    const payloadErrors = validateIntelligenceContext(payload);

    if (Object.keys(payloadErrors).length > 0) {
      setSaveStatus("error");
      setSaveMessage("Revise os campos destacados antes de salvar.");
      return false;
    }

    if (!storeId) {
      return false;
    }

    setSaving(true);
    setSaveStatus("saving");
    setSaveMessage("💾 Salvando...");

    try {
      const response = await fetch("/api/store/intelligence", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: storeId,
          context: payload,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.details || result?.error || "save_failed");
      }

      lastSavedSignatureRef.current = payloadSignature;

      if (signatureRef.current === payloadSignature && result?.data?.context) {
        setContext(normalizeLoadedContext(result.data.context));
      }

      setSaveStatus("saved");
      setSaveMessage("✅ Salvo automaticamente");
      return true;
    } catch (error: any) {
      setSaveStatus("error");
      setSaveMessage(error?.message || "Falha ao salvar automaticamente.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!didHydrateTabRef.current) {
      didHydrateTabRef.current = true;
      return;
    }

    const currentSignature = signatureRef.current;
    const isDirty = currentSignature !== lastSavedSignatureRef.current;
    const emptyAndNeverSaved =
      filledFieldsRef.current === 0 && lastSavedSignatureRef.current === createSignature({});

    if (!storeId || !isDirty || emptyAndNeverSaved) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveChanges(contextRef.current, signatureRef.current);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [activeTab, storeId]);

  function updateField(path: string, value: unknown) {
    setContext((current) => setNestedValue(current, path, value));
    setSaveStatus("idle");
    setSaveMessage("Alterações pendentes. Troque de aba para salvar.");
  }

  function toggleArrayValue(path: string, value: string) {
    const rootValue = path.split(".").reduce<unknown>((acc, key) => {
      if (!isPlainObject(acc)) return undefined;
      return acc[key];
    }, context);

    const current = Array.isArray(rootValue) ? rootValue : [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    updateField(path, next);
  }

  function setStringList(path: string, values: string[]) {
    updateField(
      path,
      values.map((value) => value.trim()).filter(Boolean)
    );
  }

  function setSuccessfulPastCtas(items: IntelligenceSuccessfulPastCta[]) {
    updateField(
      "successful_past_ctas",
      items.map((item) => ({
        ...item,
        cta: item.cta.trim(),
        context: item.context.trim(),
      }))
    );
  }

  return {
    loading,
    loadError,
    storeId,
    activeTab,
    setActiveTab,
    context,
    updateField,
    toggleArrayValue,
    setStringList,
    setSuccessfulPastCtas,
    scoreSummary,
    validationErrors,
    saving,
    saveStatus,
    saveMessage,
    saveChanges,
  };
}