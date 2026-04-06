import { BrandDNA } from "../domain/stores/brand-dna";
import { SafeZones, Rect } from "../domain/campaigns/types";
import { getLayoutDefinition } from "./catalog";
import { SeedEngine } from "./seed-engine";

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
    
    // Medidas do Logotipo (Split e outros)
    measuredLogoX?: number;
    measuredLogoY?: number;
    measuredLogoSize?: number;
    
    // Identidade V4
    dna: BrandDNA;
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

    // Configurações específicas por layout
    const isSplit = input.layout === "split";
    const bgFill = isSplit ? "#ffffff" : color;
    const strokeColor = isSplit ? color : "#ffffff";
    const strokeWidth = (isSplit ? 4 : 2) * U;
    const radius = (isSplit ? 16 : 12) * U; // 16px = rounded-2xl

    // Lógica de Paridade Absoluta para o Badge
    const badgeX = input.measuredBadgeX !== undefined ? (input.measuredBadgeX * U) : (WIDTH - 260 * (U/2.7));
    const badgeY = input.measuredBadgeY !== undefined ? (input.measuredBadgeY * U) : 48 * (U/2.7);
    const badgeW = input.measuredBadgeW !== undefined ? (input.measuredBadgeW * U) : 230 * (U/2.7);
    const badgeH = input.measuredBadgeH !== undefined ? (input.measuredBadgeH * U) : 100 * (U/2.7);
    
    const priceFontSize = input.measuredPriceFontSize ? (input.measuredPriceFontSize * U) : (20 * U);
    const labelFontSize = input.measuredLabelFontSize ? (input.measuredLabelFontSize * U) : (9 * U);

    ctx.save();
    // Centralizamos o contexto no meio do badge medido para rotacionar
    ctx.translate(badgeX + badgeW / 2, badgeY + badgeH / 2);
    
    // Rotação condicional por layout (Solid e Split não tem rotação)
    const rotationDeg = input.layout === "floating" ? 6 : 0;
    if (rotationDeg !== 0) {
        ctx.rotate((rotationDeg * Math.PI) / 180);
    }

    // 1. FUNDO DO BADGE
    roundedRect(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, radius);
    ctx.fillStyle = bgFill;
    ctx.fill();

    // 2. BORDA DINÂMICA (Sincronizada com o Preview)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    ctx.textAlign = "center";

    // 3. TEXTO DO RÓTULO (OFERTA, etc)
    if (label) {
        ctx.fillStyle = isSplit ? "#71717a" : "rgba(255,255,255,0.85)";
        ctx.font = `bold ${labelFontSize}px 'Inter', sans-serif`;
        // Ajuste vertical relativo ao centro do badge
        const labelY = price ? (-badgeH * 0.15) : (labelFontSize * 0.3);
        ctx.fillText(label.toUpperCase(), 0, labelY);
    }

    // 4. TEXTO DO PREÇO
    if (price) {
        ctx.fillStyle = isSplit ? color : "#ffffff";
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
    const { headline, body_text, cta, store, dna } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || (store as any)?.phone);

    // 0. CAMADA DE VARIAÇÃO (SEED - FUNDO)
    const layoutDef = getLayoutDefinition("solid");
    const seedEngine = new SeedEngine(dna.visual_seed);
    seedEngine.applyBackground(ctx, dna);

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
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)"; // 94% opacidade para deixar a semente "respirar"
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
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${0.5 * U}px`; // Sync HTML V11 (0.5px * U)
    
    let cursorY = 0;
    if (input.measuredHeadlineY !== undefined) {
        ctx.textBaseline = "top";
        cursorY = drawWrappedText(ctx, headline, hlX, hlY, input.measuredHeadlineW ? (input.measuredHeadlineW * U) : (WIDTH - SAFE_MARGIN * 2), hlLH, 2);
        ctx.textBaseline = "alphabetic";
    } else {
        cursorY = drawWrappedText(ctx, headline, hlX, hlY, WIDTH - SAFE_MARGIN * 2, hlLH, 2);
    }

    const bodySize = input.measuredBodyFontSize ? (input.measuredBodyFontSize * U) : 33.5;
    const bodyLH = input.measuredBodyLineHeight ? (input.measuredBodyLineHeight * U) : 42;
    const bodyX = input.measuredBodyX !== undefined ? (input.measuredBodyX * U) : SAFE_MARGIN;
    const bodyTextY = input.measuredBodyY !== undefined ? (input.measuredBodyY * U) : cursorY + 18;
    const bodyW = input.measuredBodyW ? (input.measuredBodyW * U) : (WIDTH - SAFE_MARGIN * 2);

    ctx.fillStyle = TOKENS.colors.textMuted;
    ctx.font = `500 ${bodySize}px 'Inter', 'Outfit', sans-serif`;
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    
    if (input.measuredBodyY !== undefined) {
        ctx.textBaseline = "top";
        cursorY = drawWrappedText(ctx, body_text, bodyX, bodyTextY, bodyW, bodyLH, 3);
        ctx.textBaseline = "alphabetic";
    } else {
        cursorY = drawWrappedText(ctx, body_text, bodyX, bodyTextY, bodyW, bodyLH, 3);
    }

    // 4. RODAPÉ (Linha, WhatsApp e Endereço)
    const cardY = HEIGHT * 0.55;
    const addrSize = input.measuredAddressFontSize ? (input.measuredAddressFontSize * U) : 22.5;
    const addrX = input.measuredAddressX !== undefined ? (input.measuredAddressX * U) : SAFE_MARGIN;
    const addrY = input.measuredAddressY !== undefined ? (cardY + input.measuredAddressY * U) : HEIGHT - 72;
    const addrW = input.measuredAddressW ? (input.measuredAddressW * U) : 540;

    // Linha Divisória Dinâmica (proporcional ao endereço ou CTA)
    const lineY = input.measuredAddressY !== undefined ? (addrY - 88 * (U/2.7)) : HEIGHT - 160; 
    ctx.strokeStyle = "#f4f4f5";
    ctx.lineWidth = 1 * U; // 1px real escalonado
    ctx.beginPath(); 
    ctx.moveTo(SAFE_MARGIN, lineY); 
    ctx.lineTo(WIDTH - SAFE_MARGIN, lineY); 
    ctx.stroke();

    if (whatsapp) {
        const waIconSize = input.measuredWhatsappIconSize ? (input.measuredWhatsappIconSize * U) : 28;
        const waIconX = input.measuredWhatsappX !== undefined ? (input.measuredWhatsappX * U) : SAFE_MARGIN;
        const waIconY = input.measuredWhatsappY !== undefined ? (cardY + input.measuredWhatsappY * U) : HEIGHT - 128;

        const waFontSize = input.measuredWhatsappFontSize ? (input.measuredWhatsappFontSize * U) : 24.5;
        const waTextX = input.measuredWhatsappTextX !== undefined ? (input.measuredWhatsappTextX * U) : SAFE_MARGIN + 38;
        const waTextY = input.measuredWhatsappTextY !== undefined ? (cardY + input.measuredWhatsappTextY * U) : HEIGHT - 105;

        // Ícone do WhatsApp Dinâmico
        await drawWhatsappIcon(ctx, waIconX, waIconY, waIconSize);

        // Texto do WhatsApp Dinâmico
        ctx.fillStyle = TOKENS.colors.textMuted;
        ctx.font = `700 ${waFontSize}px 'Inter', 'Outfit', sans-serif`;
        
        if (input.measuredWhatsappTextY !== undefined) {
            ctx.textBaseline = "top";
            ctx.fillText(whatsapp, waTextX, waTextY);
            ctx.textBaseline = "alphabetic";
        } else {
            ctx.fillText(whatsapp, waTextX, waTextY);
        }
    }

    ctx.fillStyle = "#a1a1aa";
    ctx.font = `500 ${addrSize}px 'Inter', 'Outfit', sans-serif`;
    ctx.textAlign = "start";
    
    if (input.measuredAddressY !== undefined) {
        ctx.textBaseline = "top";
        drawWrappedText(ctx, store?.address || "", addrX, addrY, addrW, addrSize * 1.3, 1);
        ctx.textBaseline = "alphabetic";
    } else {
        drawWrappedText(ctx, store?.address || "", addrX, addrY, addrW, 28, 2);
    }

    // CTA Dinâmico V17
    const ctaW = input.measuredCTAW ? (input.measuredCTAW * U) : 385;
    const ctaH = input.measuredCTAH ? (input.measuredCTAH * U) : 80;
    const ctaX = input.measuredCTAX !== undefined ? (input.measuredCTAX * U) : (WIDTH - SAFE_MARGIN - ctaW);
    const ctaY = input.measuredCTAY !== undefined ? (cardY + input.measuredCTAY * U) : (HEIGHT - 146);
    const ctaSize = input.measuredCTAFontSize ? (input.measuredCTAFontSize * U) : 29;

    ctx.fillStyle = TOKENS.colors.textDark;
    drawRoundedRectFill(ctx, ctaX, ctaY, ctaW, ctaH, 16 * (U / 2.7), TOKENS.colors.textDark);

    ctx.fillStyle = "white";
    ctx.font = `900 ${ctaSize}px 'Inter', 'Outfit', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cta.toUpperCase(), ctaX + ctaW / 2, ctaY + ctaH / 2);

    // FASE FINAL: TEXTURA SOBREPOSTA (OVER-TEXTURE)
    seedEngine.applyOverTexture(ctx, dna, layoutDef.zones);
}

async function drawFloatingLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, input: GraphicInput, primaryColor: string) {
    const { headline, body_text, cta, store, dna } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || (store as any)?.phone);

    // 0. CAMADA DE VARIAÇÃO (SEED - FUNDO)
    const layoutDef = getLayoutDefinition("floating");
    const seedEngine = new SeedEngine(dna.visual_seed);
    seedEngine.applyBackground(ctx, dna);

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

    // FASE FINAL: TEXTURA SOBREPOSTA (OVER-TEXTURE)
    seedEngine.applyOverTexture(ctx, dna, layoutDef.zones);
}

async function drawSplitLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, input: GraphicInput, primaryColor: string) {
    const { headline, body_text, cta, store, dna } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || (store as any)?.phone);

    // 0. CAMADA DE VARIAÇÃO (SEED - FUNDO)
    const layoutDef = getLayoutDefinition("split");
    const seedEngine = new SeedEngine(dna.visual_seed);
    seedEngine.applyBackground(ctx, dna);

    // Fator Dinâmico Universal (U)
    const U = (input.measuredWidth ? WIDTH / input.measuredWidth : 2.7);

    ctx.fillStyle = TOKENS.colors.textDark;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawImageCover(ctx, img, 0, 0, WIDTH / 2, HEIGHT);
    
    const grad = ctx.createLinearGradient(WIDTH / 2 - 100, 0, WIDTH / 2, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)"); grad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, WIDTH / 2, HEIGHT);

    // 1. CABEÇALHO DINÂMICO (Logo + Nome)
    const cardX = WIDTH * 0.5; // Início do painel de conteúdo
    const logoSize = input.measuredLogoSize ? (input.measuredLogoSize * U) : 97.2;
    const logoX = input.measuredLogoX !== undefined ? (input.measuredLogoX * U) : (cardX + 40);
    const logoY = input.measuredLogoY !== undefined ? (input.measuredLogoY * U) : 90;

    const nameFontSize = input.measuredStorePillFontSize ? (input.measuredStorePillFontSize * U) : 27;
    const nameX = input.measuredStorePillX !== undefined ? (input.measuredStorePillX * U) : (logoX + logoSize + 13.5);
    const nameY = input.measuredStorePillY !== undefined ? (input.measuredStorePillY * U) : (logoY + logoSize / 2);
    const nameW = input.measuredStorePillW ? (input.measuredStorePillW * U) : (WIDTH - nameX - SAFE_MARGIN);

    if (store?.logo_url) {
        await drawStoreLogo(ctx, store.logo_url, logoX, logoY, logoSize);
    }
    
    if (store?.name) {
        ctx.fillStyle = primaryColor;
        ctx.font = `700 ${nameFontSize}px 'Inter', 'Outfit', sans-serif`;
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        drawWrappedText(ctx, store.name.toUpperCase(), nameX, nameY, nameW, nameFontSize * 1.3, 2);
        ctx.textBaseline = "alphabetic"; // Reset
    }

    // 2. CONTEÚDO (Headline e Próximos)
    const contentX = 580;
    const contentW = 440;

    // 2. HEADLINE E DIVISOR DINÂMICOS
    const headlineFontSize = input.measuredHeadlineFontSize ? (input.measuredHeadlineFontSize * U) : 56;
    const headlineX = input.measuredHeadlineX !== undefined ? (input.measuredHeadlineX * U) : contentX;
    const headlineY = input.measuredHeadlineY !== undefined ? (input.measuredHeadlineY * U) : 250;
    const headlineW = input.measuredHeadlineW ? (input.measuredHeadlineW * U) : contentW;
    const headlineLH = input.measuredHeadlineLineHeight ? (input.measuredHeadlineLineHeight * U) : 64.8; // tight = ~1.2

    ctx.fillStyle = "#ffffff";
    ctx.font = `900 italic ${headlineFontSize}px 'Inter', 'Outfit', sans-serif`;
    ctx.textAlign = "start";
    ctx.textBaseline = "top";
    ctx.letterSpacing = (0.5 * U) + "px"; // Sincronia de tracking
    
    let cursorY = drawWrappedText(ctx, headline, headlineX, headlineY, headlineW, headlineLH, 3);
    ctx.letterSpacing = "0px"; // Reset
    
    // Divisor Dinâmico (h-1 w-10)
    const divW = 40 * U;
    const divH = 4 * U;
    const divY = cursorY + (16 * (U / 2.7));
    drawRoundedRectFill(ctx, headlineX, divY, divW, divH, 2 * (U / 2.7), primaryColor);

    // 3. SUBTÍTULO DINÂMICO
    const bodyFontSize = input.measuredBodyFontSize ? (input.measuredBodyFontSize * U) : 33.5;
    const bodyX = input.measuredBodyX !== undefined ? (input.measuredBodyX * U) : contentX;
    const bodyY = input.measuredBodyY !== undefined ? (input.measuredBodyY * U) : (cursorY + 60);
    const bodyW = input.measuredBodyW ? (input.measuredBodyW * U) : contentW;
    const bodyLH = input.measuredBodyLineHeight ? (input.measuredBodyLineHeight * U) : (bodyFontSize * 1.5);

    ctx.fillStyle = TOKENS.colors.textMutedLight;
    ctx.font = `500 italic ${bodyFontSize}px 'Inter', 'Outfit', sans-serif`;
    ctx.textBaseline = "top";
    cursorY = drawWrappedText(ctx, body_text, bodyX, bodyY, bodyW, bodyLH, 4);
    ctx.textBaseline = "alphabetic"; // Reset

    const hasEffectivePrice = price && price.trim() !== "";
    const hasEffectiveLabel = input.price_label && input.price_label.trim() !== "";

    if (hasEffectivePrice || hasEffectiveLabel) {
        const badgeX = input.measuredBadgeX !== undefined ? (input.measuredBadgeX * U) : contentX;
        const badgeY = input.measuredBadgeY !== undefined ? (input.measuredBadgeY * U) : (HEIGHT - 430);
        const badgeH = input.measuredBadgeH !== undefined ? (input.measuredBadgeH * U) : 105;
        
        const labelSize = input.measuredLabelFontSize ? (input.measuredLabelFontSize * U) : 26;
        const priceSize = input.measuredPriceFontSize ? (input.measuredPriceFontSize * U) : 82;

        if (hasEffectiveLabel) {
            ctx.fillStyle = "rgba(255,255,255,0.55)";
            
            if (input.measuredBadgeY !== undefined) {
                ctx.font = `bold ${labelSize}px 'Inter', 'Outfit', sans-serif`;
                ctx.textAlign = "start";
                ctx.textBaseline = "top";
                // @ts-ignore
                if ('letterSpacing' in ctx) ctx.letterSpacing = (0.1 * labelSize) + "px";
                ctx.fillText(input.price_label!.toUpperCase(), badgeX, badgeY);
                // @ts-ignore
                if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
            } else {
                ctx.font = TOKENS.fonts.footerBold;
                ctx.textAlign = "start";
                ctx.textBaseline = "alphabetic";
                ctx.fillText(input.price_label!.toUpperCase(), contentX, HEIGHT - 430); 
            }
        }
        
        if (hasEffectivePrice) {
            ctx.fillStyle = primaryColor;
            
            if (input.measuredBadgeY !== undefined) {
                ctx.font = `900 ${priceSize}px 'Inter', 'Outfit', sans-serif`;
                ctx.textAlign = "start";
                ctx.textBaseline = "bottom";
                // @ts-ignore
                if ('letterSpacing' in ctx) ctx.letterSpacing = (-0.05 * priceSize) + "px"; 
                ctx.fillText(price, badgeX, badgeY + badgeH); 
                // @ts-ignore
                if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
            } else {
                ctx.font = "900 82px 'Inter', 'Outfit', sans-serif";
                ctx.textAlign = "start";
                ctx.textBaseline = "alphabetic";
                ctx.fillText(price, contentX, HEIGHT - 325); 
            }
        }
        ctx.textBaseline = "alphabetic"; // Reset param
    }

    // 4. CTA (Botão de Chamada para Ação - Restauração de Paridade)
    const ctaW = input.measuredCTAW ? (input.measuredCTAW * U) : contentW;
    const ctaH = input.measuredCTAH ? (input.measuredCTAH * U) : 92;
    const ctaX = input.measuredCTAX !== undefined ? (input.measuredCTAX * U) : contentX;
    const ctaY = input.measuredCTAY !== undefined ? (input.measuredCTAY * U) : (HEIGHT - 280);
    const ctaFontSize = input.measuredCTAFontSize ? (input.measuredCTAFontSize * U) : (10 * U);

    // Sombra Projetada (Shadow XL Sincronizada)
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 35 * (U / 2.7);
    ctx.shadowOffsetY = 12 * (U / 2.7);
    drawRoundedRectFill(ctx, ctaX, ctaY, ctaW, ctaH, 8 * U, "#ffffff"); 
    ctx.restore();
    
    ctx.fillStyle = "#18181b"; // text-zinc-900
    ctx.font = `900 ${ctaFontSize}px 'Inter', 'Outfit', sans-serif`; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = (0.8 * U) + "px"; // tracking-widest sincronizado
    ctx.fillText(cta.toUpperCase(), ctaX + (ctaW / 2), ctaY + (ctaH / 2)); 
    // @ts-ignore
    if ('letterSpacing' in ctx) ctx.letterSpacing = "0px";
    ctx.textBaseline = "alphabetic"; // Reset

    if (whatsapp) {
        const waIconX = input.measuredWhatsappX !== undefined ? (input.measuredWhatsappX * U) : contentX;
        const waIconY = input.measuredWhatsappY !== undefined ? (input.measuredWhatsappY * U) : (HEIGHT - 134);
        const waIconSize = input.measuredWhatsappIconSize ? (input.measuredWhatsappIconSize * U) : (10 * U);

        const waTextX = input.measuredWhatsappTextX !== undefined ? (input.measuredWhatsappTextX * U) : (waIconX + waIconSize + 6 * U);
        const waTextY = input.measuredWhatsappTextY !== undefined ? (input.measuredWhatsappTextY * U) : (waIconY + waIconSize / 2);
        const waFontSize = input.measuredWhatsappFontSize ? (input.measuredWhatsappFontSize * U) : (8.5 * U);

        ctx.textAlign = "start";
        await drawWhatsappIcon(ctx, waIconX, waIconY, waIconSize); 
        
        ctx.fillStyle = "rgba(255,255,255,0.7)"; // text-white/70
        ctx.font = `bold ${waFontSize}px 'Inter', 'Outfit', sans-serif`;
        
        if (input.measuredWhatsappTextY !== undefined) {
            ctx.textBaseline = "top";
            ctx.fillText(whatsapp, waTextX, waTextY); 
            ctx.textBaseline = "alphabetic"; // Reset
        } else {
            ctx.textBaseline = "middle";
            ctx.fillText(whatsapp, waTextX, waTextY); 
            ctx.textBaseline = "alphabetic"; // Reset
        }
    }

    const addrSize = input.measuredAddressFontSize ? (input.measuredAddressFontSize * U) : 22.5;
    const addrX = input.measuredAddressX !== undefined ? (input.measuredAddressX * U) : contentX;
    const addrY = input.measuredAddressY !== undefined ? (input.measuredAddressY * U) : (HEIGHT - 80);
    const addrW = input.measuredAddressW ? (input.measuredAddressW * U) : contentW;

    ctx.fillStyle = "#a1a1aa";
    ctx.font = `500 ${addrSize}px 'Inter', 'Outfit', sans-serif`;
    ctx.textAlign = "start";

    if (input.measuredAddressY !== undefined) {
        ctx.textBaseline = "top";
        drawWrappedText(ctx, store?.address || "", addrX, addrY, addrW, addrSize * 1.3, 1);
        ctx.textBaseline = "alphabetic";
    } else {
        drawWrappedText(ctx, store?.address || "", addrX, addrY, addrW, 28, 2);
    }

    // FASE FINAL: TEXTURA SOBREPOSTA (OVER-TEXTURE)
    seedEngine.applyOverTexture(ctx, dna, layoutDef.zones);
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
