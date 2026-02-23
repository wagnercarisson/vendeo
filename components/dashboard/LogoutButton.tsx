"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    window.location.href = "/logout";
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full text-left"
    >
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}