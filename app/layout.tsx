import './globals.css'

export const metadata = {
  title: 'S.M.M.M. Ali Orhun | Muhasebe & Mali Danışmanlık – Antalya',
  description: "S.M.M.M. Ali Orhun – Muratpaşa / Antalya'da muhasebe, vergi danışmanlığı ve mali müşavirlik hizmetleri.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
