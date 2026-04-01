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

export interface GraphicInput {
    layout: "solid" | "split" | "floating";
    image_url: string;
    headline: string;
    body_text: string;
    cta: string;
    price: string | number | null;
    price_label?: string | null;
    store?: {
        name: string;
        whatsapp?: string | null;
        address?: string | null;
        primary_color?: string | null;
        secondary_color?: string | null;
        logo_url?: string | null;
    };
    // Camada de Paridade Absoluta (Extraída do Preview em Real-Time)
    measuredWidth?: number;
    measuredCardWidth?: number;
    measuredCardHeight?: number;
    
    // Medidas do Badge de Preço
    measuredBadgeX?: number;
    measuredBadgeY?: number;
    measuredBadgeW?: number;
    measuredBadgeH?: number;
    measuredPriceFontSize?: number;
    measuredLabelFontSize?: number;

    // Medidas do Pill da Loja (Nome da Loja dentro do Card)
    measuredStorePillX?: number;
    measuredStorePillY?: number;
    measuredStorePillW?: number;
    measuredStorePillH?: number;
    measuredStorePillFontSize?: number;

    // Medidas da Headline
    measuredHeadlineX?: number;
    measuredHeadlineY?: number;
    measuredHeadlineW?: number;
    measuredHeadlineH?: number;
    measuredHeadlineFontSize?: number;
    measuredHeadlineLineHeight?: number;

    // Medidas do Subtítulo (Body Text)
    measuredBodyX?: number;
    measuredBodyY?: number;
    measuredBodyW?: number;
    measuredBodyH?: number;
    measuredBodyFontSize?: number;
    measuredBodyLineHeight?: number;

    // Medidas do CTA (Botão de Chamada para Ação)
    measuredCTAX?: number;
    measuredCTAY?: number;
    measuredCTAW?: number;
    measuredCTAH?: number;
    measuredCTAFontSize?: number;

    // Medidas do WhatsApp (Ícone e Telefone)
    measuredWhatsappX?: number;
    measuredWhatsappY?: number;
    measuredWhatsappTextX?: number;
    measuredWhatsappTextY?: number;
    measuredWhatsappFontSize?: number;
    measuredWhatsappIconSize?: number;

    // Medidas do Endereço
    measuredAddressX?: number;
    measuredAddressY?: number;
    measuredAddressW?: number;
    measuredAddressH?: number;
    measuredAddressFontSize?: number;
}

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
    if (price == null || price === "" || price === "0,00") return "";
    
    // Se for 0 numérico puro, tratamos como vazio para ocultar o valor no badge (regra de negócio)
    if (typeof price === "number" && price === 0) return "";
    
    const num = typeof price === "string" ? Number(price.replace(/[^\d.,]/g, "").replace(",", ".")) : price;
    if (Number.isNaN(num) || (typeof num === "number" && num <= 0)) return "";
    
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
async function drawPriceBadge(
    ctx: CanvasRenderingContext2D, 
    price: string, 
    label: string | null, 
    color: string, 
    input: GraphicInput,
    U: number
) {
    if (!price && !label) return;

    // Lógica de Paridade Absoluta para o Badge
    // Se o cliente mediu, usamos a realidade da tela dele. Senão, mantemos fallbacks seguros.
    const badgeX = input.measuredBadgeX !== undefined ? (input.measuredBadgeX * U) : (WIDTH - 260 * (U/2.7));
    const badgeY = input.measuredBadgeY !== undefined ? (input.measuredBadgeY * U) : 48 * (U/2.7);
    const badgeW = input.measuredBadgeW !== undefined ? (input.measuredBadgeW * U) : 230 * (U/2.7);
    const badgeH = input.measuredBadgeH !== undefined ? (input.measuredBadgeH * U) : 100 * (U/2.7);
    
    const priceFontSize = input.measuredPriceFontSize ? (input.measuredPriceFontSize * U) : (20 * U);
    const labelFontSize = input.measuredLabelFontSize ? (input.measuredLabelFontSize * U) : (9 * U);

    ctx.save();
    // Centralizamos o contexto no meio do badge medido para rotacionar
    ctx.translate(badgeX + badgeW / 2, badgeY + badgeH / 2);
    
    // Rotação condicional por layout (Solid não tem rotação)
    const rotationDeg = input.layout === "floating" ? 6 : 0;
    if (rotationDeg !== 0) {
        ctx.rotate((rotationDeg * Math.PI) / 180);
    }

    // Fundo do Badge
    const radius = 12 * U;
    drawRoundedRectFill(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, radius, color);

    // Borda Branca Sincronizada
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2 * U;
    ctx.stroke();

    ctx.textAlign = "center";

    // Texto do Rótulo (OFERTA, etc)
    if (label) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = `bold ${labelFontSize}px 'Inter', sans-serif`;
        // Ajuste vertical relativo ao centro do badge
        const labelY = price ? (-badgeH * 0.15) : (labelFontSize * 0.3);
        ctx.fillText(label.toUpperCase(), 0, labelY);
    }

    // Texto do Preço
    if (price) {
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${priceFontSize}px 'Inter', sans-serif`;
        // Ajuste vertical relativo ao centro do badge
        const priceY = label ? (badgeH * 0.25) : (priceFontSize * 0.35);
        ctx.fillText(price, 0, priceY);
    }

    ctx.restore();
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
    const whatsapp = formatWhatsapp(store?.whatsapp || (store as any)?.phone);

    drawImageCover(ctx, img, 0, 0, WIDTH, HEIGHT * 0.55);
    const grad = ctx.createLinearGradient(0, HEIGHT * 0.55 - 200, 0, HEIGHT * 0.55);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT * 0.55);

    // 1. CALIBRAGEM DINÂMICA (Fator Dinâmico de Captura U)
    const U = input.measuredWidth ? (WIDTH / input.measuredWidth) : 2.7;

    drawPriceBadge(ctx, price, input.price_label || null, primaryColor, input, U);

    const bodyY = HEIGHT * 0.55;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, bodyY, WIDTH, HEIGHT - bodyY);

    const storePillSize = input.measuredStorePillFontSize ? (input.measuredStorePillFontSize * U) : 24; 
    const storePillX = input.measuredStorePillX !== undefined ? (input.measuredStorePillX * U) : SAFE_MARGIN;
    const storePillY = input.measuredStorePillY !== undefined ? (input.measuredStorePillY * U) : bodyY + 84;

    ctx.fillStyle = primaryColor;
    ctx.font = `bold ${storePillSize}px 'Inter', sans-serif`;
    ctx.textAlign = "start";
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "1.5px"; // +0.5px V12
    if (input.measuredStorePillY !== undefined) {
        ctx.textBaseline = "top";
        ctx.fillText((store?.name || "").toUpperCase(), storePillX, storePillY);
        ctx.textBaseline = "alphabetic";
    } else {
        ctx.fillText((store?.name || "").toUpperCase(), storePillX, storePillY);
    }

    const hlSize = input.measuredHeadlineFontSize ? (input.measuredHeadlineFontSize * U) : 76;
    const hlLH = input.measuredHeadlineLineHeight ? (input.measuredHeadlineLineHeight * U) : 70;
    const hlX = input.measuredHeadlineX !== undefined ? (input.measuredHeadlineX * U) : SAFE_MARGIN;
    const hlY = input.measuredHeadlineY !== undefined ? (input.measuredHeadlineY * U) : bodyY + 154;

    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.font = `900 italic ${hlSize}px 'Inter', 'Outfit', sans-serif`; 
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "-1px"; // Sync HTML V11
    
    let cursorY = 0;
    if (input.measuredHeadlineY !== undefined) {
        ctx.textBaseline = "top";
        cursorY = drawWrappedText(ctx, headline, hlX, hlY, input.measuredHeadlineW ? (input.measuredHeadlineW * U + 20) : (WIDTH - SAFE_MARGIN * 2), hlLH, 2);
        ctx.textBaseline = "alphabetic";
    } else {
        cursorY = drawWrappedText(ctx, headline, hlX, hlY, WIDTH - SAFE_MARGIN * 2, hlLH, 2);
    }

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
    const whatsapp = formatWhatsapp(store?.whatsapp || (store as any)?.phone);

    drawImageCover(ctx, img, 0, 0, WIDTH, HEIGHT);
    
    // 1. GRADIENTE DE FUNDO (PROFUNDIDADE)
    const overlay = ctx.createLinearGradient(0, HEIGHT, 0, 0);
    overlay.addColorStop(0, "rgba(0,0,0,0.92)");
    overlay.addColorStop(0.45, "rgba(0,0,0,0.25)");
    overlay.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = overlay; 
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. CALIBRAGEM DINÂMICA TOTAL (Fator Dinâmico de Captura)
    const U = input.measuredWidth ? (WIDTH / input.measuredWidth) : 2.7;
    
    const P4 = 16 * U;    
    const PT2 = 8 * U;    
    const MT1_5 = 6 * U;  
    const SPACE_Y_1 = 4 * U; 
    const BORDER_W = 1 * U;  

    const fallbackPillFontSize = 8 * U;
    const pillActualH = fallbackPillFontSize + (4 * U * 2);

    // LARGURA DINÂMICA REAL (Paridade Absoluta)
    const CARD_WIDTH = input.measuredCardWidth 
        ? (input.measuredCardWidth * U) 
        : (WIDTH * 0.95); 
    
    const CARD_X = (WIDTH - CARD_WIDTH) / 2;
    const CARD_RADIUS = 16 * U;
    const CONTENT_W = CARD_WIDTH - (P4 * 2);

    const fallbackHeadlineSize = 20 * U;
    const fallbackHeadlineLH = fallbackHeadlineSize * 1.25;
    const fallbackSubtitleSize = 11 * U;
    const fallbackSubtitleLH = fallbackSubtitleSize * 1.25;

    // ALTURA DINÂMICA REAL (A Mágica da Paridade)
    const CARD_HEIGHT = input.measuredCardHeight 
        ? (input.measuredCardHeight * U) 
        : (P4 + pillActualH + SPACE_Y_1 + (headline.length > 30 ? 2 : 1) * fallbackHeadlineLH + MT1_5 + (body_text.length > 60 ? 2 : 1) * fallbackSubtitleLH + PT2 + 38 * U + P4);
    
    const CARD_Y = (HEIGHT - (16 * U)) - CARD_HEIGHT;

    // DESENHO DO CARD COM SOMBRA PREMIUM
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)"; 
    ctx.shadowBlur = 80 * (U / 2.7); 
    ctx.shadowOffsetY = 40 * (U / 2.7); 
    drawRoundedRectFill(ctx, CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS, "rgba(24,24,27,0.7)");
    ctx.restore();

    // BORDA SUTIL
    drawRoundedRectStroke(ctx, CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS, "rgba(255,255,255,0.22)", BORDER_W);

    // 3. CONTEÚDO (Posicionamento Milimétrico)
    ctx.textBaseline = "top";
    let currentY = CARD_Y + P4;
    const contentX = CARD_X + P4;

    // Pill Nome da Loja (Paridade Absoluta)
    const pillFontSize = input.measuredStorePillFontSize ? (input.measuredStorePillFontSize * U) : (8 * U);
    const pillX = input.measuredStorePillX !== undefined ? (input.measuredStorePillX * U) : contentX;
    const pillY = input.measuredStorePillY !== undefined ? (input.measuredStorePillY * U) : currentY;
    const pillW = input.measuredStorePillW !== undefined ? (input.measuredStorePillW * U) : 100 * U; 
    const pillH = input.measuredStorePillH !== undefined ? (input.measuredStorePillH * U) : pillActualH;
    
    const pillRadius = 6 * U;
    ctx.font = `800 ${pillFontSize}px 'Inter', 'Outfit', sans-serif`;
    const nameText = (store?.name || "").toUpperCase();

    drawRoundedRectFill(ctx, pillX, pillY, pillW, pillH, pillRadius, primaryColor);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    
    // Centralização vertical precisa no Pill (Baseline Top)
    const pillTextY = pillY + (pillH - pillFontSize) / 2;
    ctx.fillText(nameText, pillX + pillW / 2, pillTextY);

    currentY = input.measuredStorePillY !== undefined ? pillY + pillH + SPACE_Y_1 : currentY + pillActualH + SPACE_Y_1;

    // Headline (Paridade Absoluta)
    const headlineFontSize = input.measuredHeadlineFontSize ? (input.measuredHeadlineFontSize * U) : fallbackHeadlineSize;
    const headlineLH = input.measuredHeadlineLineHeight ? (input.measuredHeadlineLineHeight * U) : (headlineFontSize * 1.25);
    const hX = input.measuredHeadlineX !== undefined ? (input.measuredHeadlineX * U) : contentX;
    const hW = input.measuredHeadlineW !== undefined ? (input.measuredHeadlineW * U) : CONTENT_W;
    const hY_base = input.measuredHeadlineY !== undefined ? (input.measuredHeadlineY * U) : currentY + (headlineFontSize * 0.8);

    ctx.fillStyle = "#ffffff";
    ctx.font = `900 italic ${headlineFontSize}px 'Inter', 'Outfit', sans-serif`;
    ctx.textAlign = "start";
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${0.5 * U}px`; 

    // Calibrador de Line-Height (Compensação de Top-Lead) para Paridade Absoluta
    const hY_final = input.measuredHeadlineY !== undefined 
        ? (input.measuredHeadlineY * U + (headlineLH - headlineFontSize) / 2) 
        : hY_base;

    // Desenhamos a Headline na posição exata medida
    const hNextY = drawWrappedText(ctx, headline, hX, hY_final, hW, headlineLH, 2);

    // Subtítulo / Body Text (Paridade Absoluta)
    const bodyFontSize = input.measuredBodyFontSize ? (input.measuredBodyFontSize * U) : fallbackSubtitleSize;
    const bodyLH = input.measuredBodyLineHeight ? (input.measuredBodyLineHeight * U) : (bodyFontSize * 1.25);
    const bX = input.measuredBodyX !== undefined ? (input.measuredBodyX * U) : contentX;
    const bY = input.measuredBodyY !== undefined ? (input.measuredBodyY * U) : hNextY + MT1_5;
    const bW = input.measuredBodyW !== undefined ? (input.measuredBodyW * U) : CONTENT_W;

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `500 ${bodyFontSize}px 'Inter', 'Outfit', sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    
    // Calibrador de Line-Height (Compensação de Top-Lead) para Subtítulo
    const bY_final = input.measuredBodyY !== undefined 
        ? (input.measuredBodyY * U + (bodyLH - bodyFontSize) / 2) 
        : bY;

    // Desenhamos o Subtítulo na posição exata medida
    const sNextY = drawWrappedText(ctx, body_text, bX, bY_final, bW, bodyLH, 2);

    // Rodapé (REVERTIDO PARA LÓGICA ORIGINAL)
    ctx.textBaseline = "alphabetic";
    currentY = sNextY + PT2;
    
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; 
    ctx.lineWidth = BORDER_W;
    ctx.beginPath();
    ctx.moveTo(contentX, currentY); 
    ctx.lineTo(CARD_X + CARD_WIDTH - P4, currentY); 
    ctx.stroke();

    // CTA
    const ctaSize = 11 * U;
    const ctaRadius = 8 * U;
    const ctaPX = 20 * U;
    const ctaPY = 8 * U;
    
    ctx.font = `900 ${ctaSize}px 'Inter', 'Outfit', sans-serif`;
    const ctaText = cta.toUpperCase();
    const fallbackCtaW = Math.max(130 * U, ctx.measureText(ctaText).width + (ctaPX * 2));
    const fallbackCtaH = ctaSize + (ctaPY * 2);
    // Variaveis originais de base (ainda usadas pelo WPP e Endereco como default/fallback)
    const ctaX = CARD_X + CARD_WIDTH - P4 - fallbackCtaW;
    const ctaBaseY = currentY + PT2;

    // Medidas dinâmicas para a Paridade Absoluta do CTA
    const dynamicCtaW = input.measuredCTAW ? input.measuredCTAW * U : fallbackCtaW;
    const dynamicCtaH = input.measuredCTAH ? input.measuredCTAH * U : fallbackCtaH;
    const dynamicCtaX = input.measuredCTAX !== undefined ? CARD_X + input.measuredCTAX * U : ctaX;
    const dynamicCtaY = input.measuredCTAY !== undefined ? CARD_Y + input.measuredCTAY * U : ctaBaseY;
    const dynamicCtaSize = input.measuredCTAFontSize ? input.measuredCTAFontSize * U : ctaSize;

    drawRoundedRectFill(ctx, dynamicCtaX, dynamicCtaY, dynamicCtaW, dynamicCtaH, ctaRadius, "#ffffff");
    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.font = `900 ${dynamicCtaSize}px 'Inter', 'Outfit', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Centralizacão perfeita baseada na box flex real
    ctx.fillText(ctaText, dynamicCtaX + dynamicCtaW / 2, dynamicCtaY + dynamicCtaH / 2);
    ctx.textBaseline = "alphabetic"; // Restaurar o padrao para não afetar os vizinhos

    // WhatsApp & Endereço
    const iconSize = 12 * U; 
    const waSize = 10 * U;
    const addrSize = 8 * U;

    if (whatsapp) {
        const waX = input.measuredWhatsappX !== undefined ? (CARD_X + input.measuredWhatsappX * U) : contentX;
        const waY = input.measuredWhatsappY !== undefined ? (CARD_Y + input.measuredWhatsappY * U) : (ctaBaseY + 4);
        const dynamicIconSize = input.measuredWhatsappIconSize ? (input.measuredWhatsappIconSize * U) : iconSize;

        await drawWhatsappIcon(ctx, waX, waY, dynamicIconSize); 

        // Posição e tamanho dinâmico do texto do telefone
        const dynamicTextSize = input.measuredWhatsappFontSize ? (input.measuredWhatsappFontSize * U) : waSize;
        const textX = input.measuredWhatsappTextX !== undefined ? (CARD_X + input.measuredWhatsappTextX * U) : (waX + dynamicIconSize + 10);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${dynamicTextSize}px 'Inter', 'Outfit', sans-serif`;
        ctx.textAlign = "start";

        if (input.measuredWhatsappTextY !== undefined) {
            ctx.textBaseline = "top";
            const textY = CARD_Y + input.measuredWhatsappTextY * U;
            ctx.fillText(whatsapp, textX, textY);
            ctx.textBaseline = "alphabetic"; // Restaura o padrao
        } else {
            ctx.fillText(whatsapp, textX, waY + (waSize * 0.85));
        }
    }

    if (store?.address) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        const dynamicAddrSize = input.measuredAddressFontSize ? (input.measuredAddressFontSize * U) : addrSize;
        ctx.font = `500 ${dynamicAddrSize}px 'Inter', 'Outfit', sans-serif`;
        ctx.textAlign = "start";
        
        if (input.measuredAddressY !== undefined && input.measuredAddressX !== undefined) {
            ctx.textBaseline = "top";
            const addrX = CARD_X + input.measuredAddressX * U;
            const addrY = CARD_Y + input.measuredAddressY * U;
            drawWrappedText(ctx, store.address, addrX, addrY, (ctaX - contentX) - 20, dynamicAddrSize * 1.3, 1);
            ctx.textBaseline = "alphabetic"; // Restaura o padrao
        } else {
            drawWrappedText(ctx, store.address, contentX, ctaBaseY + (iconSize * 1.6), (ctaX - contentX) - 20, addrSize * 1.3, 1);
        }
    }

    // 5. PREÇO EXTERNO
    drawPriceBadge(ctx, price, input.price_label || null, primaryColor, input, U);
}

async function drawSplitLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, input: GraphicInput, primaryColor: string) {
    const { headline, body_text, cta, store } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || (store as any)?.phone);

    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawImageCover(ctx, img, 0, 0, WIDTH / 2, HEIGHT);
    
    const grad = ctx.createLinearGradient(WIDTH / 2 - 100, 0, WIDTH / 2, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)"); grad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, WIDTH / 2, HEIGHT);

    // Constante Mestra de Alinhamento
    const contentX = 580;
    const contentW = 440;

    // LOGO + NOME Unificados e Centralizados Linearmente
    let headerX = contentX; 
    if (store?.logo_url) {
        await drawStoreLogo(ctx, store.logo_url, headerX, 90, 84); // Elevado (Y: 120 -> 90)
        headerX += 105; // Gap logo + texto
    }
    
    if (store?.name) {
        ctx.fillStyle = primaryColor;
        ctx.font = TOKENS.fonts.label;
        ctx.textAlign = "start";
        const maxNameWidth = contentW - (headerX - contentX);
        // Utilizando drawWrappedText para corrigir o truncamento:
        drawWrappedText(ctx, store.name.toUpperCase(), headerX, 128, maxNameWidth, 32, 2); 
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = TOKENS.fonts.headline;
    let cursorY = drawWrappedText(ctx, headline, contentX, 250, contentW, 70, 3); // Elevado e alinhado ao contentX
    
    // Divisor fino corrigido (height: 7px)
    drawRoundedRectFill(ctx, contentX, cursorY + 16, 95, 7, 2, primaryColor); 

    ctx.fillStyle = TOKENS.colors.textMutedLight;
    ctx.font = TOKENS.fonts.body;
    cursorY = drawWrappedText(ctx, body_text, contentX, cursorY + 76, contentW, 42, 4); // Alinhado ao contentX

    const hasEffectivePrice = price && price.trim() !== "";
    const hasEffectiveLabel = input.price_label && input.price_label.trim() !== "";

    if (hasEffectivePrice || hasEffectiveLabel) {
        if (hasEffectiveLabel) {
            ctx.fillStyle = "rgba(255,255,255,0.55)";
            ctx.font = TOKENS.fonts.footerBold;
            ctx.textAlign = "start";
            ctx.fillText(input.price_label!.toUpperCase(), contentX, HEIGHT - 430); 
        }
        
        if (hasEffectivePrice) {
            ctx.fillStyle = primaryColor;
            ctx.font = "900 82px 'Inter', 'Outfit', sans-serif";
            ctx.fillText(price, contentX, HEIGHT - 325); 
        }
    }

    drawRoundedRectFill(ctx, contentX, HEIGHT - 280, contentW, 92, 16, "#ffffff"); 
    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.font = "900 26px 'Inter', 'Outfit', sans-serif"; 
    ctx.textAlign = "center";
    ctx.fillText(cta.toUpperCase(), contentX + (contentW / 2), HEIGHT - 222); 

    if (whatsapp) {
        ctx.textAlign = "start";
        await drawWhatsappIcon(ctx, contentX, HEIGHT - 134, 28); 
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = TOKENS.fonts.footerBold;
        ctx.fillText(whatsapp, contentX + 38, HEIGHT - 111); 
    }

    ctx.fillStyle = "#a1a1aa";
    ctx.font = TOKENS.fonts.footerRegular;
    ctx.textAlign = "start";
    drawWrappedText(ctx, store?.address || "", contentX, HEIGHT - 80, contentW, 28, 2);
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
