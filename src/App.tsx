import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Handle GitHub Pages SPA redirect on mount
  React.useEffect(() => {
    const redirect = sessionStorage.redirect;
    if (redirect) {
      delete sessionStorage.redirect;
      console.log('Handling redirect from 404:', redirect);
      
      // Extract the path from the redirect URL and navigate to it
      try {
        const redirectUrl = new URL(redirect);
        const newPath = redirectUrl.pathname.replace('/photawn-speedometer', '') || '/';
        if (newPath !== window.location.pathname) {
          window.history.replaceState(null, '', newPath);
        }
      } catch (e) {
        console.warn('Failed to parse redirect URL:', redirect, e);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.DEV ? '' : '/photawn-speedometer'}>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
