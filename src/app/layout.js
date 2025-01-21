// app/layout.js

import "./globals.css";
import Image from "next/image";

export const metadata = {
  title: "TruePaceConnect",
  description: "Embodiment of True Knowledge",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/TruePace.svg" sizes="any" />
      </head>
      <body suppressHydrationWarning={true} className="min-h-screen">
        <header className="flex items-center p-4 bg-white shadow-sm fixed">
          <div className="flex items-center gap-2">
            <Image 
              src="/TruePace.svg" 
              alt="TruePace Connect Logo" 
              width={32}
              height={32}
              priority
            />
            <h1 className="text-xl font-semibold">TruePace Connect</h1>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}