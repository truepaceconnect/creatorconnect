'use client'
import { useEffect, useState } from 'react';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { FaCamera } from "react-icons/fa";

const ProfilePictureUpload = () => {
  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/creators/verify`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        const data = await response.json();
        setUserData(data);
        // Set the existing channel picture as preview if it exists
        if (data.channel?.picture) {
          setPreviewUrl(data.channel.picture);
        }
      } catch (err) {
        setError('Failed to fetch user data');
      }
    };

    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed');
        return;
      }

      if (file.size > maxSize) {
        setError('File must be smaller than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const idToken = await auth.currentUser?.getIdToken();
      
      const formData = new FormData();
      formData.append('channelPicture', selectedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/creators/upload-channel-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setSuccess(true);
      // Update the userData with the new picture URL
      setUserData(prev => ({
        ...prev,
        channel: {
          ...prev.channel,
          picture: result.pictureUrl
        }
      }));

      // Clear the selected file
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={previewUrl || userData?.channel?.picture} 
                  alt="Channel Picture" 
                />
                <AvatarFallback>
                  {userData?.channel?.name?.[0]?.toUpperCase() || 'CH'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => document.getElementById('picture-upload').click()}
              >
                <FaCamera className="h-4 w-4" />
              </Button>
            </div>

            <input
              id="picture-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full max-w-sm"
              >
                {uploading ? 'Uploading...' : 'Upload Channel Picture'}
              </Button>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>Channel picture updated successfully!</AlertDescription>
              </Alert>
            )}

            <div className="w-full max-w-sm space-y-2">
              <h2 className="text-xl font-semibold">{userData?.channel?.name}</h2>
              <p className="text-gray-500">{userData?.creator?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePictureUpload;