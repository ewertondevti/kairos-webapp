import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PrimeReactProvider } from "primereact/api";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ThemeProvider/index.tsx";
import "./globals.scss";
import AppProvider from "./store/context/AppProvider.tsx";
import AuthProvider from "./store/context/AuthProvider.tsx";

library.add(fas);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </AuthProvider>

          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  </StrictMode>
);
