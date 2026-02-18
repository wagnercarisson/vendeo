"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function StorePage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSave() {
    setMsg("Salvando...");

    const { error } = await supabase.from("stores").insert({
      name,
      city,
      state
    });

    if (error) {
      setMsg("Erro: " + error.message);
      return;
    }

    setMsg("Loja salva com sucesso!");
    setName("");
    setCity("");
    setState("");
  }

  return (
    <main style={{ padding: 40, maxWidth: 400 }}>
      <h1>Cadastro da Loja</h1>

      <input
        placeholder="Nome da loja"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Cidade"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Estado"
        value={state}
        onChange={(e) => setState(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleSave}>
        Salvar
      </button>

      <p>{msg}</p>
    </main>
  );
}
