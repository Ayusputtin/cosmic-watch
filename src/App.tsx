import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Watchlist from "./pages/Watchlist";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AUTH_KEY = "cosmicwatch_isAuthenticated";

import { WatchlistProvider } from "./context/WatchlistContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WatchlistProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route
            path="/"
            element={
              localStorage.getItem(AUTH_KEY) === "true" ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["scientist", "enthusiast"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute allowedRoles={["scientist", "enthusiast"]}>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute allowedRoles={["scientist", "enthusiast"]}>
                <Alerts />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </WatchlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
