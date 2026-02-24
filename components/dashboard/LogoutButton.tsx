"use client";

import { useState } from "react";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    window.location.href = "/logout";
  }

  return (
    <button onClick={handleLogout} disabled={loading} className={className}>
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}