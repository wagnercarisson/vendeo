import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DetailedFeedback, GenerationFeedback } from "./types";

export async function saveDetailedFeedback(feedback: DetailedFeedback) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("feedback_messages")
    .insert(feedback);

  if (error) {
    console.error("[saveDetailedFeedback] error:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveGenerationFeedback(feedback: GenerationFeedback) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("generation_feedback")
    .insert(feedback);

  if (error) {
    console.error("[saveGenerationFeedback] error:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
