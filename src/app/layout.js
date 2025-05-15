import "./globals.css";
import ConditionalHeader from "@/component/ConditionalHeader.js/ConditionalHeader";

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
        <ConditionalHeader />
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}