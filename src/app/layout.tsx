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
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');}else{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full w-full bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-300">
        <CinemaPageCurtainsProvider>
          {children}
          <CinemaFloatingNav />
        </CinemaPageCurtainsProvider>
      </body>
    </html>
  );
}
