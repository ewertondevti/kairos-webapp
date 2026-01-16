import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.scss";
import Providers from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kairós Portugal",
    template: "%s | Kairós Portugal",
  },
  description: "Igreja Kairós Portugal.",
  applicationName: "Kairós Portugal",
  manifest: "/manifest.json",
  icons: {
    icon: "/kairos-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
