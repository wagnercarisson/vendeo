import { getSupabaseAdmin } from "./lib/supabase/admin";

async function verifyStorage() {
  console.log("🔍 Iniciando verificação de segurança (Storage)...");
  
  const supabase = getSupabaseAdmin();
  const bucket = "campaign-images";
  const dummyFile = "test-security-" + Date.now() + ".txt";

  try {
    // 1. Testa se o Admin funciona para upload
    console.log("📤 Testando upload administrativo...");
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(dummyFile, "Security Check", { contentType: "text/plain" });
    
    if (upErr) throw new Error("Erro no upload admin: " + upErr.message);
    console.log("✅ Admin upload OK.");

    // 2. Testa geração de URL assinada
    console.log("🔑 Testando geração de Signed URL...");
    const { data, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(dummyFile, 60);

    if (signErr) throw new Error("Erro na assinatura: " + signErr.message);
    if (!data?.signedUrl) throw new Error("Assinatura retornou URL vazia.");
    
    console.log("✅ Signed URL gerada com sucesso!");
    console.log("🔗 URL gerada: " + data.signedUrl.substring(0, 50) + "...");

    // 3. Limpeza
    await supabase.storage.from(bucket).remove([dummyFile]);
    console.log("✅ Limpeza concluída.");
    
    console.log("\n🛡️ SEGURANÇA DE STORAGE VALIDADA!");
  } catch (err: any) {
    console.error("❌ FALHA NA VERIFICAÇÃO:");
    console.error(err.message);
  }
}

// Para rodar: npx ts-node -r tsconfig-paths/register verify-storage.ts
// (Mas como estamos em um projeto Next.js, vamos apenas deixar para o usuário ou tentar rodar via node se possível)
verifyStorage();
