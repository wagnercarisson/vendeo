// app/campaigns/page.tsx
import { supabase } from "../../lib/supabase";

export default async function CampaignsPage() {
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, product_name, price, audience, objective, image_url, store_id, created_at")
    .order("created_at", { ascending: false });

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
          ))}
        </ul>
      )}
    </main>
  );
}
