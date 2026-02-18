export const metadata = {
  title: "Vendeo",
  description: "Plataforma de campanhas para lojas",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
