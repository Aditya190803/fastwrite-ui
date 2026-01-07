
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { MainHeader } from "./components/ui/header";
import { MainFooter } from "./components/ui/footer";
import Index from "./pages/Index";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="fastwrite-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-black">
              <div className="noise-bg" />
              <div className="grid-bg fixed inset-0 z-0 opacity-20 pointer-events-none" />
              <MainHeader />
              <main className="flex-grow z-10">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <MainFooter />
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
