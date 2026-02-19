// app/campaigns/page.tsx
import { supabase } from "../../lib/supabase";

export default async function CampaignsPage() {
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, product_name, price, audience, objective, image_url, store_id, created_at")
    .order("created_at", { ascending: false });

  async function generateAndSave(campaign: any) {
  const res = await fetch("/api/generate/campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_name: campaign.product_name,
      price: campaign.price,
      audience: campaign.audience,
      objective: campaign.objective,
    }),
  });

  const data = await res.json();

  const { error } = await supabase
    .from("campaigns")
    .update({
      ai_caption: data.caption,
      ai_text: data.text,
      ai_cta: data.cta,
      ai_hashtags: data.hashtags,
      ai_generated_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  if (error) {
    alert("Erro ao salvar IA");
    return;
  }

  alert("Texto gerado e salvo!");
}

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Campanhas</h1>

      {error && <p style={{ color: "crimson" }}>Erro: {error.message}</p>}

      {!error && (!campaigns || campaigns.length === 0) && (
        <p>Nenhuma campanha ainda.</p>
      )}

      {!error && campaigns && campaigns.length > 0 && (
        <ul style={{ lineHeight: 1.8 }}>
          {campaigns.map((c) => (
            <li key={c.id}>
              <strong>{c.product_name}</strong> — R$ {Number(c.price ?? 0).toFixed(2)} — {c.audience} — {c.objective}
            </li>
            <button onClick={() => generateAndSave(c)}>
              Gerar texto com IA
            </button>
           
            {c.ai_caption && (
              <div style={{ marginTop: 10 }}>
                <strong>Legenda:</strong> {c.ai_caption} <br />
                <strong>Texto:</strong> {c.ai_text} <br />
                <strong>CTA:</strong> {c.ai_cta} <br />
                <strong>Hashtags:</strong> {c.ai_hashtags}
              </div>
            )}


          ))}
        </ul>
      )}
    </main>
  );
 
}
