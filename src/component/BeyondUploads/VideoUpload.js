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
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
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
        setVideoPreview(URL.createObjectURL(file));
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
        setThumbnailPreview(URL.createObjectURL(file));
        setError('');
      }
    };
  
    // Cleanup URLs when component unmounts or when files change
    React.useEffect(() => {
      return () => {
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      };
    }, [videoPreview, thumbnailPreview]);
  const handleUpload = async () => {
    // ... rest of the upload logic remains the same ...
  };

  
  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="video">Video File</Label>
          <div className="flex items-center space-x-4">
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
            >
              <FaUpload className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
            {videoFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {videoFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                >
                  <MdCancel className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {videoPreview && (
            <div className="mt-2">
              <video 
                className="max-w-xs rounded-lg"
                controls
                src={videoPreview}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail</Label>
          <div className="flex items-center space-x-4">
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
            >
              <FaUpload className="mr-2 h-4 w-4" />
              Upload Thumbnail
            </Button>
            {thumbnail && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {thumbnail.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                >
                  <MdCancel className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {thumbnailPreview && (
            <div className="mt-2">
              <img 
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="max-w-xs rounded-lg"
              />
            </div>
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
            placeholder="Type a tag and press Enter"
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