import type { Metadata } from "next";
import "./globals.css";
import { CinemaPageCurtainsProvider } from "@/components/cinema-page-curtains";
import { CinemaFloatingNav } from "@/components/cinema-floating-nav";

export const metadata: Metadata = {
  title: "Cenima — Works '26",
  description: "Boutique Cinema Index & 3D Wheel Showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-full w-full bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-300">
        <CinemaPageCurtainsProvider>
          {children}
          <CinemaFloatingNav />
        </CinemaPageCurtainsProvider>
      </body>
    </html>
  );
}
