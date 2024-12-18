import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { getProfile } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SherbyRide",
    description: "Covoiturage de UdS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();
    queryClient.prefetchQuery({
        queryKey: ["user-profile"],
        queryFn: () => getProfile(false),
    });

    return (
        <html lang="en">
            <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0" />

            <QueryProvider>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <body className={`${inter.className} antialiased flex flex-col h-screen`}>
                        <NavBar />

                        <div className="flex-1 grid overflow-y-auto">{children}</div>

                        <Footer />
                        <Toaster richColors />
                    </body>
                </HydrationBoundary>
            </QueryProvider>
        </html>
    );
}
