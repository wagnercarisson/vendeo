// app/page.tsx
import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name, city, state, created_at")
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Vendeo</h1>

      <h2 style={{ marginTop: 24 }}>Lojas cadastradas</h2>

      {error && (
        <p style={{ color: "crimson" }}>
          Erro ao buscar lojas: {error.message}
        </p>
      )}

      {!error && (!stores || stores.length === 0) && (
        <p>Nenhuma loja cadastrada ainda.</p>
      )}

      {!error && stores && stores.length > 0 && (
        <ul style={{ lineHeight: 1.8 }}>
          {stores.map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong> — {s.city}/{s.state}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
