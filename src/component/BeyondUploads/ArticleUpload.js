import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { auth } from '@/app/(auth)/firebase/ClientApp';
import { MdCancel } from "react-icons/md";
import { FaUpload } from 'react-icons/fa';
import { FiLoader } from "react-icons/fi";

const ArticleUpload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    previewContent: '',
    fullContent: '',
    previewImage: null,
    imagePreview: null,
    tags: [],
    readTime: 0
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        previewImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      previewImage: null,
      imagePreview: null
    }));
    const fileInput = document.getElementById('preview-image');
    if (fileInput) fileInput.value = '';
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('previewContent', formData.previewContent);
      formDataToSend.append('fullContent', formData.fullContent);
      formDataToSend.append('readTime', calculateReadTime(formData.fullContent));
      
      if (formData.previewImage) {
        formDataToSend.append('previewImage', formData.previewImage);
      }

      formData.tags.forEach(tag => {
        formDataToSend.append('tags', tag);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create article');
      }

      setSuccess(true);
      setFormData({
        title: '',
        previewContent: '',
        fullContent: '',
        previewImage: null,
        imagePreview: null,
        tags: [],
        readTime: 0
      });

      const fileInput = document.getElementById('preview-image');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Article Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter article title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview-content">Preview Content</Label>
            <Textarea
              id="preview-content"
              value={formData.previewContent}
              onChange={(e) => setFormData(prev => ({ ...prev, previewContent: e.target.value }))}
              placeholder="Enter a brief preview of your article..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full-content">Full Article Content</Label>
            <Textarea
              id="full-content"
              value={formData.fullContent}
              onChange={(e) => setFormData(prev => ({ ...prev, fullContent: e.target.value }))}
              placeholder="Enter your full article content..."
              className="min-h-[300px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview-image">Preview Image</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="preview-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('preview-image').click()}
              >
                <FaUpload className="mr-2 h-4 w-4" />
                Upload Preview Image
              </Button>
              {formData.previewImage && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formData.previewImage.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                  >
                    <MdCancel className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {formData.imagePreview && (
              <div className="mt-2">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-gray-200 rounded-full p-1"
                  >
                    <MdCancel className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Article published successfully!</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Article'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArticleUpload;