"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { BiLogOut } from 'react-icons/bi';
import { RiLayoutLine } from 'react-icons/ri';
import { FiUser } from 'react-icons/fi';
import { MdAnnouncement} from "react-icons/md";
import { GoDotFill } from "react-icons/go";

export default function NavigationBar() {
  const router = useRouter();
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

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Remove the direct navigation here and just return null
  if (!currentUser) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="flex items-center whitespace-nowrap px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              <RiLayoutLine className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium">Creator Dashboard</span>
            </Link>

            <Link 
              href="/announcements" 
              className="flex items-center whitespace-nowrap px-3 py-2 hover:bg-gray-100 rounded-md relative"
            >
              <MdAnnouncement className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium">Announcements</span>
              {hasUnreadAnnouncements && (
                <GoDotFill
                  className="absolute -top-1 -right-1 w-4 h-4 text-red-500"
                />
              )}
            </Link>

            <Link 
              href="/profile" 
              className="flex items-center whitespace-nowrap px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              <FiUser className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium">Profile</span>
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