import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
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
    return (
        <html lang="en">
            <QueryProvider>
                <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
                    <NavBar />

                    <div className="flex-1 grid">{children}</div>

                    <Footer />
                    <Toaster />
                </body>
            </QueryProvider>
        </html>
    );
}
