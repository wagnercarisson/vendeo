import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) {
            return new Response("Invalid usage", { status: 400 });
        }

        const { 
            layout = "solid", 
            imageUrl, 
            headline = "", 
            bodyText = "", 
            cta = "", 
            price = "", 
            storeName = "", 
            storeAddress = "", 
            whatsapp = "", 
            primaryColor = "#10b981" 
        } = body;

        const formatPrice = (p: string | number) => {
            if (!p) return "";
            const num = typeof p === "string" ? parseFloat(p.replace(",", ".")) : p;
            if (isNaN(num)) return p.toString();
            return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        };
        const formattedPrice = formatPrice(price);

        const formatWhatsApp = (val: string) => {
            if (!val) return null;
            const cleaned = val.replace(/\D/g, "");
            if (cleaned.length === 11) {
                return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
            }
            return val;
        };
        const formattedWhatsapp = formatWhatsApp(whatsapp);

        // A URL da imagem DEVE ser um buffer/array ou absolute url completa.
        // O next/og não renderiza URLs relativas ou instáveis perfeitamente, garantimos url string
        
        let content;

        if (layout === "floating") {
            content = (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src={imageUrl}
                        alt="Background"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                        }}
                    ></div>

                    {formattedPrice && (
                        <div
                            style={{
                                position: "absolute",
                                right: "40px",
                                top: "40px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: primaryColor,
                                border: "4px solid white",
                                borderRadius: "24px",
                                padding: "16px 32px",
                                transform: "rotate(6deg)",
                                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                            }}
                        >
                            <span style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: "4px" }}>
                                Oferta
                            </span>
                            <span style={{ fontSize: "48px", fontWeight: 900, color: "white", lineHeight: 1 }}>
                                {formattedPrice}
                            </span>
                        </div>
                    )}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            position: "absolute",
                            bottom: "40px",
                            left: "40px",
                            right: "40px",
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            border: "2px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "32px",
                            padding: "40px",
                            color: "white",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex" }}>
                                <span
                                    style={{
                                        backgroundColor: primaryColor,
                                        padding: "8px 16px",
                                        borderRadius: "12px",
                                        fontSize: "16px",
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        marginBottom: "16px",
                                    }}
                                >
                                    {storeName}
                                </span>
                            </div>
                            
                            <h3 style={{ fontSize: "56px", fontWeight: 900, textTransform: "uppercase", fontStyle: "italic", lineHeight: 1.1, margin: "0 0 16px 0", maxWidth: "90%" }}>
                                {headline}
                            </h3>
                            <p style={{ fontSize: "24px", fontWeight: 500, color: "rgba(255,255,255,0.8)", margin: "0 0 32px 0", lineHeight: 1.4, maxWidth: "90%" }}>
                                {bodyText}
                            </p>
                            
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid rgba(255,255,255,0.1)", paddingTop: "24px", width: "100%" }}>
                                <div style={{ display: "flex", flexDirection: "column", color: "rgba(255,255,255,0.8)", fontSize: "20px", fontWeight: 600 }}>
                                    {formattedWhatsapp && (
                                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                            <span style={{ color: "#10b981", marginRight: "12px" }}>■</span>
                                            {formattedWhatsapp}
                                        </div>
                                    )}
                                    <div style={{ display: "flex", opacity: 0.7, maxWidth: "400px" }}>{storeAddress}</div>
                                </div>
                                
                                <div style={{ backgroundColor: "white", padding: "16px 32px", borderRadius: "16px", fontSize: "24px", fontWeight: 900, color: "#18181b", textTransform: "uppercase", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}>
                                    {cta}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (layout === "split") {
            content = (
                <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#18181b" }}>
                    <div style={{ display: "flex", flexDirection: "column", width: "50%", height: "100%", position: "relative" }}>
                        <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(to right, transparent, rgba(0,0,0,0.6))" }}></div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", width: "50%", padding: "60px", justifyContent: "space-between", color: "white" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "24px", fontWeight: 900, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "16px", marginBottom: "40px" }}>
                                {storeName}
                            </span>
                            
                            <h3 style={{ fontSize: "64px", fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase", fontStyle: "italic", margin: "0 0 24px 0" }}>
                                {headline}
                            </h3>
                            <div style={{ height: "8px", width: "80px", backgroundColor: primaryColor, borderRadius: "8px", marginBottom: "32px" }}></div>
                            
                            <p style={{ fontSize: "28px", fontWeight: 500, color: "rgba(255,255,255,0.6)", fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
                                {bodyText}
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                            {formattedPrice && (
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "20px", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginBottom: "8px" }}>VALOR</span>
                                    <span style={{ fontSize: "80px", fontWeight: 900, color: primaryColor, lineHeight: 1 }}>{formattedPrice}</span>
                                </div>
                            )}
                            
                            <div style={{ backgroundColor: "white", padding: "24px 40px", borderRadius: "16px", fontSize: "28px", fontWeight: 900, color: "#18181b", textTransform: "uppercase", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
                                {cta}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", fontSize: "20px", color: "rgba(255,255,255,0.5)", borderTop: "2px solid rgba(255,255,255,0.05)", paddingTop: "32px" }}>
                                {formattedWhatsapp && (
                                    <div style={{ display: "flex", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: "8px", alignItems: "center" }}>
                                        <span style={{ color: "#10b981", marginRight: "12px" }}>■</span>
                                        {formattedWhatsapp}
                                    </div>
                                )}
                                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{storeAddress}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // solid
            content = (
                <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "white" }}>
                    <div style={{ display: "flex", position: "relative", height: "55%", width: "100%" }}>
                        <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}></div>
                        
                        {formattedPrice && (
                            <div style={{ position: "absolute", top: "40px", right: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: primaryColor, border: "4px solid white", borderRadius: "24px", padding: "16px 32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                                <span style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.9)", marginBottom: "4px" }}>Oferta</span>
                                <span style={{ fontSize: "48px", fontWeight: 900, color: "white", lineHeight: 1 }}>{formattedPrice}</span>
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "50px", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "24px", fontWeight: 800, textTransform: "uppercase", color: primaryColor, letterSpacing: "0.1em", marginBottom: "16px" }}>
                                {storeName}
                            </span>
                            <h3 style={{ fontSize: "56px", fontWeight: 900, lineHeight: 1.1, color: "#18181b", textTransform: "uppercase", fontStyle: "italic", margin: "0 0 16px 0" }}>
                                {headline}
                            </h3>
                            <p style={{ fontSize: "28px", fontWeight: 500, color: "#52525b", lineHeight: 1.4, margin: "0 0 24px 0" }}>
                                {bodyText}
                            </p>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderTop: "2px solid #f4f4f5", paddingTop: "32px", marginTop: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", maxWidth: "55%", fontSize: "24px", color: "#a1a1aa", fontWeight: 500 }}>
                                {formattedWhatsapp && (
                                    <div style={{ display: "flex", alignItems: "center", color: "#52525b", fontWeight: 700, marginBottom: "8px" }}>
                                        <span style={{ color: "#10b981", marginRight: "12px" }}>■</span>
                                        {formattedWhatsapp}
                                    </div>
                                )}
                                <span style={{ opacity: 0.8 }}>{storeAddress}</span>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#18181b", padding: "20px 48px", borderRadius: "16px", fontSize: "24px", fontWeight: 900, color: "white", textTransform: "uppercase", flex: 1, marginLeft: "32px", textAlign: "center" }}>
                                {cta}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return new ImageResponse(
            (
                <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                    {content}
                </div>
            ),
            {
                width: 1080,
                height: 1350, // 4:5 Instagram Portrait
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
