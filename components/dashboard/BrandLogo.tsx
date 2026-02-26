export function BrandLogo() {
  return (
    <div className="leading-tight">
      <div
        className="
          text-xl font-extrabold tracking-wide
          bg-gradient-to-r from-orange-500 via-orange-400 to-emerald-500
          bg-clip-text text-transparent
        "
        style={{ fontFamily: "var(--font-brand)" }}
      >
        VENDEO
      </div>
      <div className="text-xs text-white/70">Motor de vendas</div>
    </div>
  );
}