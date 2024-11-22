'use client'
import { useEffect, useState } from 'react';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import ProfilePictureUpload from './ProfilePictureUpload/ProfilePictureUpload';

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/creators/verify`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      const data = await response.json();
      setUserData(data);
    };

    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Creator Profile</h1>
      {userData && (
        <div>
          <p>Channel Name: {userData.channel?.name}</p>
          <p>Email: {userData.creator?.email}</p>
          <ProfilePictureUpload/>
        </div>
      )}
    </div>
  );
}