'use client'
import { useState } from 'react';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import Image from 'next/image';

export default function ProfilePictureUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
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
      alert('Channel picture uploaded successfully!');
      
      // Optionally refresh user data or update UI
    } catch (err) {
      setError('Failed to upload picture');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input 
          type="file" 
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          className="file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {previewUrl && (
          <Image 
            src={previewUrl} 
            alt="Preview" 
            width={100} 
            height={100} 
            className="rounded-full object-cover"
          />
        )}
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button 
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Channel Picture'}
      </button>
    </div>
  );
}