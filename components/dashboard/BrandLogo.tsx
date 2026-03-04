import Image from "next/image";

type BrandProps = {
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  showTagline?: boolean;
  /** light = páginas claras (login), dark = fundo escuro (dashboard/hero escuro) */
  variant?: "light" | "dark";
  className?: string;
};

export default function BrandLogo({
  size = "md",
  align = "left",
  showTagline = true,
  variant = "light",
  className = "",
}: BrandProps) {
  const isCenter = align === "center";

  const sizes = {
    sm: {
      icon: "h-8 w-8",
      text: "text-2xl",
      tagline: "text-[11px]",
      wordShiftPx: 4,
      iconPx: 32,
    },
    md: {
      icon: "h-9 w-9",
      text: "text-3xl",
      tagline: "text-xs",
      wordShiftPx: 5,
      iconPx: 36,
    },
    lg: {
      icon: "h-12 w-12",
      text: "text-4xl",
      tagline: "text-sm",
      wordShiftPx: 6,
      iconPx: 48,
    },
  } as const;

  const s = sizes[size];

  const taglineClass =
    variant === "dark" ? "text-white/90" : "text-zinc-600";

  return (
    <div
      className={`flex flex-col ${isCenter ? "items-center text-center" : "items-start text-left"
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
            transform: `translateY(${s.wordShiftPx}px)`,
          }}
        >
          VENDEO
        </div>
      </div>

      {showTagline && (
        <div className={`mt-2 leading-snug ${taglineClass} ${s.tagline}`}>
          Motor de vendas para lojas físicas
        </div>
      )}
    </div>
  );
}