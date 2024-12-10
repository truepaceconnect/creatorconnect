"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { BiLogOut } from 'react-icons/bi';
import { RiLayoutLine } from 'react-icons/ri';
import { FiUser } from 'react-icons/fi';
import { MdAnnouncement, MdCircleNotifications } from "react-icons/md";

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
      // Set hasUnreadAnnouncements to false in case of error to avoid showing incorrect notification
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

  // Don't render navigation items until we confirm auth state
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // If no user is logged in, you might want to show different navigation or redirect
  if (!currentUser) {
    router.push('/');
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/dashboard" className="flex items-center">
              <RiLayoutLine className="w-5 h-5 mr-2" />
              <span>Creator Dashboard</span>
            </Link>

            <Link href="/announcements" className="flex items-center relative">
              <MdAnnouncement className="w-5 h-5 mr-2" />
              <span>Announcements</span>
              {hasUnreadAnnouncements && (
                <MdCircleNotifications className="absolute -top-2 -right-2 w-5 h-5 text-red-500" />
              )}
            </Link>

            <Link href="/profile" className="flex items-center">
              <FiUser className="w-5 h-5 mr-2" />
              <span>Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <BiLogOut className="w-5 h-5 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}