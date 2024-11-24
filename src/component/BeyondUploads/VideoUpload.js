import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FaUpload, FaCheckCircle } from "react-icons/fa";
import { IoAlertCircle } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { auth } from '@/app/(auth)/firebase/ClientApp';


const VideoUpload = ({ onVideoUploaded }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('Video size must be less than 100MB');
        return;
      }
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for thumbnail');
        return;
      }
      setThumbnail(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !thumbnail || !title.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('Please sign in to upload videos');
        return;
      }

      setIsUploading(true);
      setError('');
      
      // Get the ID token
      const idToken = await currentUser.getIdToken(true); // Force token refresh
      
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('thumbnail', thumbnail);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);

      // Create XMLHttpRequest to handle upload progress
      const xhr = new XMLHttpRequest();
      const promise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(new Error(xhr.response || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/videos/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
      xhr.send(formData);

      const response = await promise;
      
      setSuccess(true);
      if (onVideoUploaded) {
        onVideoUploaded(response);
      }
      
      // Reset form
      setVideoFile(null);
      setThumbnail(null);
      setTitle('');
      setDescription('');
      setTags('');
      setUploadProgress(0);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="video">Video File</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('video').click()}
              className="w-full"
            >
              <FaUpload className="mr-2 h-4 w-4" />
              {videoFile ? 'Change Video' : 'Upload Video'}
            </Button>
            {videoFile && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setVideoFile(null)}
              >
                <MdCancel className="h-4 w-4" />
              </Button>
            )}
          </div>
          {videoFile && (
            <p className="text-sm text-gray-500">{videoFile.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('thumbnail').click()}
              className="w-full"
            >
              <FaUpload className="mr-2 h-4 w-4" />
              {thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
            </Button>
            {thumbnail && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setThumbnail(null)}
              >
                <MdCancel className="h-4 w-4" />
              </Button>
            )}
          </div>
          {thumbnail && (
            <p className="text-sm text-gray-500">{thumbnail.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="news, politics, technology"
          />
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 text-center">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <IoAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <FaCheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Video uploaded successfully!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || !videoFile || !thumbnail || !title.trim()}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;