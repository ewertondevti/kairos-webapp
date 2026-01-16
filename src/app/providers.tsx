"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import AppProvider from "@/store/context/AppProvider";
import AuthProvider from "@/store/context/AuthProvider";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntdApp } from "antd";
import { PrimeReactProvider } from "primereact/api";
import { useState } from "react";

library.add(fas);

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
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
    <ThemeProvider>
      <AntdApp>
        <PrimeReactProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppProvider>
                {children}
                {process.env.NODE_ENV === "development" && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </AppProvider>
            </AuthProvider>
          </QueryClientProvider>
        </PrimeReactProvider>
      </AntdApp>
    </ThemeProvider>
  );
}
