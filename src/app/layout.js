// app/layout.js

import "./globals.css";

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
       
          {children}
      
      </body>
    </html>
  );
}