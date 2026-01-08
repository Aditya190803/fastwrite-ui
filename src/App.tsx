
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { MainHeader } from "./components/ui/header";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
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
            <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-black font-body overflow-x-clip">
              <div className="noise-bg" />
              <div className="grid-bg fixed inset-0 z-0 opacity-40 pointer-events-none" />
              <div className="grid-bg-fine fixed inset-0 z-0 opacity-20 pointer-events-none" />
              
              {/* Decorative Blueprint Lines */}
              <div className="fixed top-20 left-0 blueprint-line-h z-0 opacity-50" />
              <div className="fixed top-1/3 left-0 blueprint-line-h z-0 opacity-30" />
              <div className="fixed bottom-1/4 left-0 blueprint-line-h z-0 opacity-40" />
              <div className="fixed left-20 top-0 blueprint-line-v z-0 opacity-50" />
              <div className="fixed right-20 top-0 blueprint-line-v z-0 opacity-30" />
              <MainHeader />
              <main className="flex-grow z-10">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
