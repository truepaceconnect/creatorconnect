import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { BiLogOut } from 'react-icons/bi';
import { RiLayoutLine } from 'react-icons/ri';
import { FiUser } from 'react-icons/fi';
import { MdAnnouncement } from "react-icons/md";

export default function NavigationBar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/dashboard" 
              className="flex items-center px-4 text-gray-700 hover:text-blue-600"
            >
              <RiLayoutLine className="w-5 h-5 mr-2" />
              <span className="font-medium">Creator Dashboard</span>
            </Link>

            <Link
              href="/announcements"
              className="flex items-center px-4 text-gray-700 hover:text-blue-600"
            >
              <MdAnnouncement className="w-5 h-5 mr-2" />
              <span className="font-medium">Announcements</span>
            </Link>

          </div>


          
          <div className="flex items-center space-x-4">
            <Link 
              href="/profile" 
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-md"
            >
              <FiUser className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
            >
              <BiLogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}