"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import AppProvider from "@/store/context/AppProvider";
import AuthProvider from "@/store/context/AuthProvider";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Poppins, Playfair_Display } from "next/font/google";
import { PrimeReactProvider } from "primereact/api";
import { useState } from "react";
import "./globals.css";

// Modern sans-serif font for body text
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Elegant serif font for headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

library.add(fas);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <html lang="pt-BR" className={`${poppins.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/kairos-logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <title>Kairós Portugal</title>
        <link
          href="https://use.fontawesome.com/releases/v6.6.0/css/all.css"
          rel="stylesheet"
          type="text/css"
          media="all"
        />
      </head>
      <body>
        <ThemeProvider>
          <PrimeReactProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <AppProvider>
                  {children}
                  <ReactQueryDevtools initialIsOpen={false} />
                </AppProvider>
              </AuthProvider>
            </QueryClientProvider>
          </PrimeReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
