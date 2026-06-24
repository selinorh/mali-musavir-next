import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://aliorhun.com'),
  title: 'Ali Orhun | Serbest Muhasebeci Mali Müşavir',
  description:
    "Antalya Muratpaşa'da muhasebe, vergi danışmanlığı ve mali müşavirlik hizmetleri.",

  openGraph: {
    title: 'Ali Orhun | Serbest Muhasebeci Mali Müşavir',
    description:
      "Antalya Muratpaşa'da muhasebe, vergi danışmanlığı ve mali müşavirlik hizmetleri.",
    url: 'https://aliorhun.com',
    siteName: 'Ali Orhun SMMM',
    locale: 'tr_TR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}