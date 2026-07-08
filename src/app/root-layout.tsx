import { useSyncExternalStore } from "react";
import { Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { WifiOff } from "lucide-react";
import { queryClient } from "./query-client";
import { isOffline, subscribeOffline } from "@/lib/api";

function OfflineBanner() {
  const offline = useSyncExternalStore(subscribeOffline, isOffline, () => false);
  if (!offline) return null;
  return (
    <div className="sticky top-0 z-60 flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-center text-[11px] font-bold text-amber-950">
      <WifiOff className="h-3.5 w-3.5" /> Mode demo hors-ligne - le serveur SenBazar est injoignable, les donnees affichees ne sont pas sauvegardees.
    </div>
  );
}

export function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
