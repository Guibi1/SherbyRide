"use client";
import { getQueryClient } from "@/lib/query";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
