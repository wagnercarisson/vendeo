import Image from "next/image";

type BrandProps = {
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  showTagline?: boolean;
  className?: string;
};

export default function Brand({
  size = "md",
  align = "center",
  showTagline = true,
  className = "",
}: BrandProps) {
  const isCenter = align === "center";

  const sizes = {
    sm: {
      icon: "h-8 w-8",
      text: "text-2xl",
      tagline: "text-[11px]",
      translate: "translateY(4px)",
      iconPx: 32,
    },
    md: {
      icon: "h-9 w-9",
      text: "text-3xl",
      tagline: "text-xs",
      translate: "translateY(5px)",
      iconPx: 36,
    },
    lg: {
      icon: "h-12 w-12",
      text: "text-4xl",
      tagline: "text-sm",
      translate: "translateY(6px)",
      iconPx: 48,
    },
  };

  const s = sizes[size];

  return (
    <div
      className={`flex flex-col ${
        isCenter ? "items-center text-center" : "items-start text-left"
      } ${className}`}
    >
      {/* Grupo ícone + VENDEO com centralização óptica travada */}
      <div
        className="grid items-center gap-3"
        style={{ gridTemplateColumns: `${s.iconPx}px auto` }}
      >
        <div className={`relative shrink-0 ${s.icon}`}>
          <Image
            src="/brand/vendeo-icon.svg"
            alt="Vendeo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div
          className={`${s.text} font-extrabold tracking-tight leading-none select-none`}
          style={{
            color: "#16a34a",
            transform: s.translate,
          }}
        >
          VENDEO
        </div>
      </div>

      {showTagline && (
        <div className={`mt-2 leading-snug text-white/70 ${s.tagline}`}>
          Motor de vendas para lojas físicas
        </div>
      )}
    </div>
  );
}