import "./globals.css";
import { Sora } from "next/font/google";

const brandFont = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-brand",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${brandFont.variable} antialiased`}>{children}</body>
    </html>
  );
}