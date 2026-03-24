import { resolveImageUrl } from "@/lib/supabase/storage";

type Layout = "solid" | "floating" | "split";

type StoreData = {
    name?: string | null;
    address?: string | null;
    whatsapp?: string | null;
    phone?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
} | null | undefined;

type RenderCampaignArtInput = {
    layout?: Layout;
    image_url: string;
    headline: string;
    body_text: string;
    cta: string;
    price?: number | string | null;
    store?: StoreData;
};

const WIDTH = 1080;
const HEIGHT = 1350;

function formatPrice(price?: number | string | null) {
    if (price == null || price === "") return "";
    const num =
        typeof price === "string" ? Number(price.replace(",", ".")) : price;

    if (Number.isNaN(num)) return String(price);

    return num.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatWhatsapp(val?: string | null) {
    if (!val) return "";
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return val;
}

function getPrimaryColor(store?: StoreData) {
    return store?.primary_color || "#10b981";
}

function roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
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

function drawRoundedRectFill(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string
) {
    ctx.save();
    roundedRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
}

function drawRoundedRectStroke(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    stroke: string,
    lineWidth = 1
) {
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
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
        img.src = src;
    });
}

function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
) {
    const iw = img.width;
    const ih = img.height;

    const scale = Math.max(dw / iw, dh / ih);
    const sw = dw / scale;
    const sh = dh / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number
) {
    const words = (text || "").split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        const width = ctx.measureText(test).width;

        if (width <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            current = word;
            if (lines.length >= maxLines) break;
        }
    }

    if (current && lines.length < maxLines) {
        lines.push(current);
    }

    if (words.length > 0 && lines.length === maxLines) {
        let last = lines[maxLines - 1] || "";
        while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
            last = last.slice(0, -1);
        }
        lines[maxLines - 1] = `${last}…`;
    }

    lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * lineHeight);
    });

    return y + lines.length * lineHeight;
}

function drawPriceBadge(
    ctx: CanvasRenderingContext2D,
    price: string,
    primary_color: string,
    x: number,
    y: number
) {
    if (!price) return;

    const w = 190;
    const h = 100;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;

    drawRoundedRectFill(ctx, x, y, w, h, 24, primary_color);
    drawRoundedRectStroke(ctx, x, y, w, h, 24, "#ffffff", 4);

    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "800 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OFERTA", x + w / 2, y + 28);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 42px sans-serif";
    ctx.fillText(price, x + w / 2, y + 72);
    ctx.restore();
}

function drawSolidLayout(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    input: Required<RenderCampaignArtInput> & { primary_color: string }
) {
    const { headline, body_text, cta, store, primary_color } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || store?.phone);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const topH = Math.round(HEIGHT * 0.55);
    drawImageCover(ctx, img, 0, 0, WIDTH, topH);

    const grad = ctx.createLinearGradient(0, topH - 220, 0, topH);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, topH);

    drawPriceBadge(ctx, price, primary_color, WIDTH - 240, 42);

    const bodyY = topH;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, bodyY, WIDTH, HEIGHT - bodyY);

    ctx.fillStyle = primary_color;
    ctx.font = "800 24px sans-serif";
    ctx.fillText((store?.name || "").toUpperCase(), 60, bodyY + 68);

    ctx.fillStyle = "#18181b";
    ctx.font = "900 italic 58px sans-serif";
    let cursorY = drawWrappedText(ctx, headline || "", 60, bodyY + 135, 880, 66, 2);

    ctx.fillStyle = "#52525b";
    ctx.font = "500 28px sans-serif";
    cursorY = drawWrappedText(ctx, body_text || "", 60, cursorY + 18, 860, 40, 3);

    ctx.strokeStyle = "#f4f4f5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, HEIGHT - 160);
    ctx.lineTo(WIDTH - 60, HEIGHT - 160);
    ctx.stroke();

    ctx.fillStyle = "#52525b";
    ctx.font = "700 24px sans-serif";
    if (whatsapp) {
        ctx.fillText(whatsapp, 60, HEIGHT - 105);
    }

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "500 20px sans-serif";
    drawWrappedText(ctx, store?.address || "", 60, HEIGHT - 72, 500, 28, 2);

    drawRoundedRectFill(ctx, 700, HEIGHT - 138, 320, 74, 16, "#18181b");
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((cta || "").toUpperCase(), 860, HEIGHT - 92);
    ctx.textAlign = "start";
}

function drawFloatingLayout(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    input: Required<RenderCampaignArtInput> & { primary_color: string }
) {
    const { headline, body_text, cta, store, primary_color } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || store?.phone);

    drawImageCover(ctx, img, 0, 0, WIDTH, HEIGHT);

    const overlay = ctx.createLinearGradient(0, HEIGHT, 0, 0);
    overlay.addColorStop(0, "rgba(0,0,0,0.92)");
    overlay.addColorStop(0.45, "rgba(0,0,0,0.25)");
    overlay.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawPriceBadge(ctx, price, primary_color, WIDTH - 240, 42);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    drawRoundedRectFill(ctx, 40, HEIGHT - 430, WIDTH - 80, 350, 32, "rgba(0,0,0,0.56)");
    drawRoundedRectStroke(ctx, 40, HEIGHT - 430, WIDTH - 80, 350, 32, "rgba(255,255,255,0.18)", 2);
    ctx.restore();

    drawRoundedRectFill(ctx, 72, HEIGHT - 388, 230, 44, 12, primary_color);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 18px sans-serif";
    ctx.fillText((store?.name || "").toUpperCase(), 92, HEIGHT - 358);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 italic 58px sans-serif";
    let cursorY = drawWrappedText(ctx, headline || "", 72, HEIGHT - 290, 860, 66, 2);

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "500 28px sans-serif";
    cursorY = drawWrappedText(ctx, body_text || "", 72, cursorY + 12, 820, 40, 3);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(72, HEIGHT - 155);
    ctx.lineTo(WIDTH - 72, HEIGHT - 155);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "700 22px sans-serif";
    if (whatsapp) {
        ctx.fillText(whatsapp, 72, HEIGHT - 112);
    }

    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = "500 18px sans-serif";
    drawWrappedText(ctx, store?.address || "", 72, HEIGHT - 82, 430, 24, 2);

    drawRoundedRectFill(ctx, 760, HEIGHT - 136, 248, 70, 16, "#ffffff");
    ctx.fillStyle = "#18181b";
    ctx.font = "900 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((cta || "").toUpperCase(), 884, HEIGHT - 92);
    ctx.textAlign = "start";
}

function drawSplitLayout(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    input: Required<RenderCampaignArtInput> & { primary_color: string }
) {
    const { headline, body_text, cta, store, primary_color } = input;
    const price = formatPrice(input.price);
    const whatsapp = formatWhatsapp(store?.whatsapp || store?.phone);

    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawImageCover(ctx, img, 0, 0, WIDTH / 2, HEIGHT);

    const grad = ctx.createLinearGradient(WIDTH / 2 - 80, 0, WIDTH / 2, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH / 2, HEIGHT);

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "900 22px sans-serif";
    ctx.fillText((store?.name || "").toUpperCase(), 600, 82);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 italic 62px sans-serif";
    let cursorY = drawWrappedText(ctx, headline || "", 600, 185, 420, 70, 3);

    drawRoundedRectFill(ctx, 600, cursorY + 10, 88, 8, 4, primary_color);

    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = "500 28px sans-serif";
    cursorY = drawWrappedText(ctx, body_text || "", 600, cursorY + 72, 410, 40, 4);

    if (price) {
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = "700 20px sans-serif";
        ctx.fillText("VALOR", 600, HEIGHT - 280);

        ctx.fillStyle = primary_color;
        ctx.font = "900 74px sans-serif";
        ctx.fillText(price, 600, HEIGHT - 190);
    }

    drawRoundedRectFill(ctx, 600, HEIGHT - 150, 400, 78, 16, "#ffffff");
    ctx.fillStyle = "#18181b";
    ctx.font = "900 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((cta || "").toUpperCase(), 800, HEIGHT - 100);
    ctx.textAlign = "start";

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(600, HEIGHT - 220);
    ctx.lineTo(1010, HEIGHT - 220);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "700 20px sans-serif";
    if (whatsapp) {
        ctx.fillText(whatsapp, 600, HEIGHT - 40);
    }

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "500 18px sans-serif";
    drawWrappedText(ctx, store?.address || "", 600, HEIGHT - 12, 380, 22, 2);
}

export async function renderCampaignArtToBlob(
    input: RenderCampaignArtInput
): Promise<Blob> {
    if (typeof window === "undefined") {
        throw new Error("Renderização da arte disponível apenas no navegador.");
    }

    if (!input.image_url) {
        throw new Error("Imagem do produto ausente para gerar a arte final.");
    }

    const layout: Layout = input.layout || "solid";
    const primary_color = getPrimaryColor(input.store);

    const resolvedUrl = await resolveImageUrl(input.image_url);
    if (!resolvedUrl) throw new Error("Não foi possível resolver a URL da imagem.");
    const img = await loadImage(resolvedUrl);

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Não foi possível iniciar o canvas da arte final.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const normalizedInput = {
        layout,
        image_url: input.image_url,
        headline: input.headline || "",
        body_text: input.body_text || "",
        cta: input.cta || "",
        price: input.price ?? "",
        store: input.store,
        primary_color: primary_color,
    };

    if (layout === "floating") {
        drawFloatingLayout(ctx, img, normalizedInput);
    } else if (layout === "split") {
        drawSplitLayout(ctx, img, normalizedInput);
    } else {
        drawSolidLayout(ctx, img, normalizedInput);
    }

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1);
    });

    if (!blob) {
        throw new Error("Falha ao exportar a arte final em PNG.");
    }

    return blob;
}