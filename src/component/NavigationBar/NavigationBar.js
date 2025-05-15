"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { BiLogOut } from 'react-icons/bi';
import { RiLayoutLine } from 'react-icons/ri';
import { FiUser } from 'react-icons/fi';
import { MdAnnouncement } from "react-icons/md";
import { GoDotFill } from "react-icons/go";

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (user) {
        checkUnreadAnnouncements(user);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add a new useEffect to handle navigation when user state changes
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, isLoading, router]);

  const checkUnreadAnnouncements = async (user) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch announcements');

      const announcements = await response.json();
      const hasUnread = announcements.some(announcement => 
        !announcement.views.some(view => view.userId === user.uid)
      );

      setHasUnreadAnnouncements(hasUnread);
    } catch (error) {
      console.error('Failed to check unread announcements:', error);
      setHasUnreadAnnouncements(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    return pathname === path;
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Remove the direct navigation here and just return null
  if (!currentUser) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 w-full z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image 
                src="/TruePace.svg" 
                alt="TruePace Connect Logo" 
                width={32}
                height={32}
                priority
              />
              <h1 className="text-xl font-semibold">TruePace Connect</h1>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`flex items-center whitespace-nowrap px-3 py-2 rounded-md relative ${
                isActive('/dashboard') 
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <RiLayoutLine className={`w-5 h-5 mr-2 flex-shrink-0 ${
                isActive('/dashboard') ? 'text-blue-600' : ''
              }`} />
              <span className="font-medium">Creator Dashboard</span>
              {isActive('/dashboard') && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-md"></div>
              )}
            </Link>

            <Link 
              href="/announcements" 
              className={`flex items-center whitespace-nowrap px-3 py-2 rounded-md relative ${
                isActive('/announcements') 
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <MdAnnouncement className={`w-5 h-5 mr-2 flex-shrink-0 ${
                isActive('/announcements') ? 'text-blue-600' : ''
              }`} />
              <span className="font-medium">Announcements</span>
              {hasUnreadAnnouncements && (
                <GoDotFill
                  className="absolute -top-1 -right-1 w-4 h-4 text-red-500"
                />
              )}
              {isActive('/announcements') && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-md"></div>
              )}
            </Link>

            <Link 
              href="/profile" 
              className={`flex items-center whitespace-nowrap px-3 py-2 rounded-md relative ${
                isActive('/profile') 
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <FiUser className={`w-5 h-5 mr-2 flex-shrink-0 ${
                isActive('/profile') ? 'text-blue-600' : ''
              }`} />
              <span className="font-medium">Profile</span>
              {isActive('/profile') && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-md"></div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center whitespace-nowrap px-3 py-2 hover:bg-gray-100 rounded-md text-gray-700 hover:text-gray-900"
            >
              <BiLogOut className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}