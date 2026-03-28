import { Phone } from "lucide-react";

export type Layout = "solid" | "floating" | "split";

export type GraphicStoreData = {
    name?: string | null;
    address?: string | null;
    whatsapp?: string | null;
    phone?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
};

export type GraphicInput = {
    layout: Layout;
    image_url: string;
    headline: string;
    body_text: string;
    cta: string;
    price?: number | string | null;
    store?: GraphicStoreData;
};

const WIDTH = 1080;
const HEIGHT = 1350;
const SAFE_MARGIN = 86; // Respiro generoso

// Design Tokens V3
const TOKENS = {
    fonts: {
        headline: "900 italic 56px 'Inter', 'Outfit', system-ui, sans-serif",
        headlineNonItalic: "900 56px 'Inter', 'Outfit', system-ui, sans-serif",
        body: "500 33.5px 'Inter', 'Outfit', system-ui, sans-serif", // +0.5px V15
        label: "800 26.5px 'Inter', 'Outfit', system-ui, sans-serif", // +0.5px V16
        footerBold: "700 26px 'Inter', 'Outfit', system-ui, sans-serif", // Aumentado de 24
        footerRegular: "500 22.5px 'Inter', 'Outfit', system-ui, sans-serif", // +0.5px V21
        button: "900 23px 'Inter', 'Outfit', system-ui, sans-serif", // +1px V15
    },
    colors: {
        textDark: "#18181b",
        textLight: "#ffffff",
        textMuted: "#52525b",
        textMutedLight: "rgba(255,255,255,0.75)",
        overlay: "rgba(0,0,0,0.55)",
    },
    shadows: {
        premium: {
            color: "rgba(0,0,0,0.18)",
            blur: 45,
            offsetY: 15
        },
        floating: {
            color: "rgba(0,0,0,0.32)",
            blur: 65,
            offsetY: 28
        }
    }
};

function formatPrice(price?: number | string | null) {
    if (price == null || price === "") return "";
    const num = typeof price === "string" ? Number(price.replace(",", ".")) : price;
    if (Number.isNaN(num)) return String(price);
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatWhatsapp(val?: string | null) {
    if (!val) return "";
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return val;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawRoundedRectFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
    ctx.save();
    roundedRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
}

function drawRoundedRectStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, stroke: string, lineWidth = 1) {
    ctx.save();
    roundedRect(ctx, x, y, w, h, r);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
        img.src = src;
    });
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(dw / iw, dh / ih);
    const sw = dw / scale;
    const sh = dh / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

async function drawWhatsappIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    try {
        const icon = await loadImage("/whatsapp.png");
        ctx.drawImage(icon, x, y, size, size);
    } catch (e) {
        // Fallback: Bola verde + fone 45° (vínculo perfeito com o preview)
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#22c55e";
        ctx.fill();
        ctx.rotate(45 * Math.PI / 180);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = size * 0.22;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, 0.4, Math.PI * 0.6 + 0.4);
        ctx.stroke();
        ctx.restore();
    }
}

async function drawStoreLogo(ctx: CanvasRenderingContext2D, url: string | null | undefined, x: number, y: number, size: number) {
    if (!url) return;
    try {
        const logo = await loadImage(url);
        ctx.save();
        // Círculo de clipping
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, x, y, size, size);
        ctx.restore();
        // Borda suave
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();
    } catch (e) {
        console.error("Erro ao carregar logo para o Canvas", e);
    }
}

function drawPriceBadge(ctx: CanvasRenderingContext2D, price: string, color: string, x: number, y: number, layout: Layout) {
    if (!price) return;
    const rotation = layout === "floating" ? (6 * Math.PI) / 180 : 0;
    
    // @ts-ignore V14 
    if ('letterSpacing' in ctx) ctx.letterSpacing = "-1.5px";

    ctx.font = TOKENS.fonts.headlineNonItalic;
    const priceWidth = ctx.measureText(price).width;
    
    ctx.font = TOKENS.fonts.label;
    const labelWidth = ctx.measureText("OFERTA").width;
    
    // Aumento de +5% V16 (h: 135px, min-w: 231px, r: 25px)
    const paddingX = 74; 
    const w = Math.max(231, priceWidth + paddingX, labelWidth + paddingX);
    const h = 135; 
    const startX = x - (w - 220); // Mantemos a ancoragem pela direita

    ctx.save();
    ctx.translate(startX + w / 2, y + h / 2);
    ctx.rotate(rotation);
    ctx.translate(-(startX + w / 2), -(y + h / 2));

    ctx.shadowColor = TOKENS.shadows.premium.color;
    ctx.shadowBlur = TOKENS.shadows.premium.blur;
    ctx.shadowOffsetY = TOKENS.shadows.premium.offsetY;

    drawRoundedRectFill(ctx, startX, y, w, h, 25, color); 
    drawRoundedRectStroke(ctx, startX, y, w, h, 25, "#ffffff", 4);

    ctx.shadowColor = "transparent";
    ctx.textAlign = "center"; // Mantido V14 (OK Usuário)
    
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = TOKENS.fonts.label;
    ctx.fillText("OFERTA", startX + w / 2, y + 47); // Recalculado V16

    ctx.fillStyle = "#ffffff";
    ctx.font = TOKENS.fonts.headlineNonItalic;
    ctx.fillText(price, startX + w / 2, y + 106); // Recalculado V16
    ctx.restore();
    
    // Reset
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
    const words = (text || "").split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            current = word;
            if (lines.length >= maxLines) break;
        }
    }
    if (current && lines.length < maxLines) lines.push(current);
    
    lines.forEach((line, index) => {
        ctx.fillText(index === maxLines - 1 && lines.length === maxLines && words.length > lines.join(" ").split(" ").length ? line + "..." : line, x, y + index * lineHeight);
    });
    return y + lines.length * lineHeight;
}

async function drawSolidLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, input: GraphicInput, primaryColor: string) {
    const { headline, body_text, cta, store } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || store?.phone);

    drawImageCover(ctx, img, 0, 0, WIDTH, HEIGHT * 0.55);
    const grad = ctx.createLinearGradient(0, HEIGHT * 0.55 - 200, 0, HEIGHT * 0.55);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT * 0.55);

    drawPriceBadge(ctx, price, primaryColor, WIDTH - 260, 48, "solid");

    const bodyY = HEIGHT * 0.55;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, bodyY, WIDTH, HEIGHT - bodyY);

    ctx.fillStyle = primaryColor;
    ctx.font = TOKENS.fonts.label;
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "1.5px"; // +0.5px V12
    ctx.fillText((store?.name || "").toUpperCase(), SAFE_MARGIN, bodyY + 84);

    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.font = TOKENS.fonts.headline; 
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "-1px"; // Sync HTML V11
    let cursorY = drawWrappedText(ctx, headline, SAFE_MARGIN, bodyY + 154, WIDTH - SAFE_MARGIN * 2, 70, 2);

    ctx.fillStyle = TOKENS.colors.textMuted;
    ctx.font = TOKENS.fonts.body;
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    cursorY = drawWrappedText(ctx, body_text, SAFE_MARGIN, cursorY + 18, WIDTH - SAFE_MARGIN * 2, 42, 3); // Gap 18px V16

    ctx.strokeStyle = "#f4f4f5";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(SAFE_MARGIN, HEIGHT - 160); ctx.lineTo(WIDTH - SAFE_MARGIN, HEIGHT - 160); ctx.stroke();

    if (whatsapp) {
        await drawWhatsappIcon(ctx, SAFE_MARGIN, HEIGHT - 128, 28);
        ctx.fillStyle = TOKENS.colors.textMuted;
        ctx.font = TOKENS.fonts.footerBold;
        ctx.fillText(whatsapp, SAFE_MARGIN + 38, HEIGHT - 105);
    }

    ctx.fillStyle = "#a1a1aa";
    ctx.font = TOKENS.fonts.footerRegular;
    drawWrappedText(ctx, store?.address || "", SAFE_MARGIN, HEIGHT - 72, 540, 28, 2);

    // CTA Expandido V15 (+1px Texto -> 29px)
    const ctaW = 385;
    const ctaH = 96;
    drawRoundedRectFill(ctx, WIDTH - ctaW - SAFE_MARGIN, HEIGHT - 146, ctaW, ctaH, 16, TOKENS.colors.textDark);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 29px 'Inter', 'Outfit', sans-serif"; // +1px V15
    ctx.textAlign = "center";
    ctx.fillText(cta.toUpperCase(), WIDTH - ctaW/2 - SAFE_MARGIN, HEIGHT - 92);
}

async function drawFloatingLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, input: GraphicInput, primaryColor: string) {
    const { headline, body_text, cta, store } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || store?.phone);

    drawImageCover(ctx, img, 0, 0, WIDTH, HEIGHT);
    const overlay = ctx.createLinearGradient(0, HEIGHT, 0, 0);
    overlay.addColorStop(0, "rgba(0,0,0,0.95)");
    overlay.addColorStop(0.4, "rgba(0,0,0,0.25)");
    overlay.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = overlay; ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawPriceBadge(ctx, price, primaryColor, WIDTH - 260, 48, "floating");

    ctx.save();
    ctx.shadowColor = TOKENS.shadows.floating.color;
    ctx.shadowBlur = TOKENS.shadows.floating.blur;
    ctx.shadowOffsetY = TOKENS.shadows.floating.offsetY;
    // Card Float V19: 35px de margem (L/B) | 940x437px (H+25px V18)
    drawRoundedRectFill(ctx, 35, HEIGHT - 472, 940, 437, 40, TOKENS.colors.overlay);
    drawRoundedRectStroke(ctx, 35, HEIGHT - 472, 940, 437, 40, "rgba(255,255,255,0.22)", 2);
    ctx.restore();

    // Pill do nome da loja recalculado V20 (Margem 50px | Altura 50px)
    ctx.font = TOKENS.fonts.label;
    const nameText = (store?.name || "").toUpperCase();
    const nameWidth = ctx.measureText(nameText).width;
    const pillW = nameWidth + 60; // Mais respiro lateral V8
    drawRoundedRectFill(ctx, 85, HEIGHT - 442, pillW, 50, 12, primaryColor); // h:50, x:35+50=85
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(nameText, 85 + pillW / 2, HEIGHT - 408); // Centralizado verticalmente V20

    ctx.fillStyle = "#ffffff";
    ctx.font = TOKENS.fonts.headline;
    ctx.textAlign = "start"; // Reset
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "-1.2px"; // +0.3px V18
    let cursorY = drawWrappedText(ctx, headline, 85, HEIGHT - 330, WIDTH - 200, 70, 2); // x:85

    ctx.fillStyle = TOKENS.colors.textMutedLight;
    ctx.font = TOKENS.fonts.body; // 33.5px
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    cursorY = drawWrappedText(ctx, body_text, 85, cursorY + 15, WIDTH - 220, 42, 3); // x:85, Gap -5px V20

    // CTA V20: 50px do canto inferior direito do card
    const ctaW = 385;
    const ctaX = (35 + 940) - 50 - ctaW; 
    const ctaY = (HEIGHT - 35) - 50 - 96;

    // Linha divisória interna V23 (Reforçada e Sincronizada 50px margins)
    ctx.strokeStyle = "rgba(255,255,255,0.22)"; 
    ctx.lineWidth = 1.5;
    ctx.beginPath(); 
    ctx.moveTo(85, ctaY - 25); 
    ctx.lineTo(925, ctaY - 25); // (CardX:35 + CardW:940 - 50) = 925
    ctx.stroke();

    drawRoundedRectFill(ctx, ctaX, ctaY, ctaW, 96, 20, "#ffffff");
    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.font = "900 29px 'Inter', 'Outfit', sans-serif"; // +1px V15
    ctx.textAlign = "center";
    ctx.fillText(cta.toUpperCase(), ctaX + ctaW/2, ctaY + 54);

    if (whatsapp) {
        // Alinhado com o badge do cta por cima V20 (+2px V21, +5px V22 -> +7px)
        await drawWhatsappIcon(ctx, 85, ctaY + 7, 32); 
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = TOKENS.fonts.footerBold;
        ctx.textAlign = "start";
        ctx.fillText(whatsapp, 125, ctaY + 32);
    }

    // Endereço trazido para dentro do card e alinhado por baixo V20 (-2px V21, -5px V22 -> -7px)
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = TOKENS.fonts.footerRegular;
    ctx.textAlign = "start";
    drawWrappedText(ctx, store?.address || "", 85, ctaY + 85, 440, 28, 2);
}

async function drawSplitLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, input: GraphicInput, primaryColor: string) {
    const { headline, body_text, cta, store } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || store?.phone);

    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawImageCover(ctx, img, 0, 0, WIDTH / 2, HEIGHT);
    
    const grad = ctx.createLinearGradient(WIDTH / 2 - 100, 0, WIDTH / 2, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)"); grad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, WIDTH / 2, HEIGHT);

    // LOGO + NOME Conjuntos V29 (+5% Logo -> 84px)
    let headerX = 620; 
    if (store?.logo_url) {
        await drawStoreLogo(ctx, store.logo_url, 620, 120, 84);
        headerX += 95; // Mantido para fixar posição do nome
    }
    
    if (store?.name) {
        ctx.fillStyle = primaryColor;
        ctx.font = TOKENS.fonts.label;
        ctx.textAlign = "start";
        ctx.fillText(store.name.toUpperCase(), headerX, 170); // Alinhado verticalmente centro logo
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = TOKENS.fonts.headline;
    let cursorY = drawWrappedText(ctx, headline, 620, 280, 420, 72, 3); // Baixado Y V26
    drawRoundedRectFill(ctx, 620, cursorY + 16, 95, 10, 4, primaryColor); // +15px V30 (Total 95px)

    ctx.fillStyle = TOKENS.colors.textMutedLight;
    ctx.font = TOKENS.fonts.body;
    cursorY = drawWrappedText(ctx, body_text, 620, cursorY + 84, 430, 42, 4); // x:620 V26

    if (price) {
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = TOKENS.fonts.footerBold;
        ctx.textAlign = "start";
        ctx.fillText("VALOR", 580, HEIGHT - 430); // Elevado 100px V24
        ctx.fillStyle = primaryColor;
        ctx.font = "900 82px 'Inter', 'Outfit', sans-serif";
        ctx.fillText(price, 580, HEIGHT - 325); // Elevado 100px V24
    }

    drawRoundedRectFill(ctx, 580, HEIGHT - 280, 440, 92, 16, "#ffffff"); // Elevado 100px V24
    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.font = "900 24.5px 'Inter', 'Outfit', sans-serif"; // +1.5px V25
    ctx.textAlign = "center";
    ctx.fillText(cta.toUpperCase(), 800, HEIGHT - 222); // Elevado 100px V24

    if (whatsapp) {
        ctx.textAlign = "start";
        await drawWhatsappIcon(ctx, 580, HEIGHT - 134, 28); // 40px para baixo V25
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = TOKENS.fonts.footerBold;
        ctx.fillText(whatsapp, 618, HEIGHT - 111); // 40px para baixo V25
    }

    // Endereço adicionado e elevado V24
    ctx.fillStyle = "#a1a1aa";
    ctx.font = TOKENS.fonts.footerRegular;
    ctx.textAlign = "start";
    drawWrappedText(ctx, store?.address || "", 580, HEIGHT - 80, 440, 28, 2);
}

export async function renderGraphicToBlob(input: GraphicInput): Promise<Blob> {
    console.log("%c [VENDEO] GRAPHIC ENGINE V10 ACTIVE ", "color: #10b981; font-weight: bold; border: 1px solid #10b981; padding: 2px 4px; border-radius: 4px;");
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH; canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const img = await loadImage(input.image_url);
    const primaryColor = input.store?.primary_color || "#10b981";

    if (input.layout === "floating") await drawFloatingLayout(ctx, img, input, primaryColor);
    else if (input.layout === "split") await drawSplitLayout(ctx, img, input, primaryColor);
    else await drawSolidLayout(ctx, img, input, primaryColor);

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png", 1));
}
