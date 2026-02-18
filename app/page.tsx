export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Teste de variáveis</h1>

      <p>
        SUPABASE URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ não encontrada"}
      </p>

      <p>
        SUPABASE KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ OK" : "❌ não encontrada"}
      </p>
    </main>
  );
}
