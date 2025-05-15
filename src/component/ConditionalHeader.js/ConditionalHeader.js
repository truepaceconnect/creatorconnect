"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Paths that use the NavigationBar component
  const pagesWithNavBar = ['/dashboard', '/announcements', '/profile'];
  
  // Check if current path should have the simple header
  const shouldShowHeader = !pagesWithNavBar.some(path => pathname.startsWith(path));
  
  if (!shouldShowHeader) return null;
  
  return (
    <header className="flex items-center p-4 bg-white shadow-sm fixed w-full z-10">
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
  );
}