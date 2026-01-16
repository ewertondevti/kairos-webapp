import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppProvider from "@/store/context/AppProvider";
import AuthProvider from "@/store/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PrimeReactProvider } from "primereact/api";
import { useState } from "react";
import "@/app/globals.scss";

const App = ({ Component, pageProps }: AppProps) => {
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
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <Component {...pageProps} />
              <ReactQueryDevtools initialIsOpen={false} />
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  );
};

export default App;
