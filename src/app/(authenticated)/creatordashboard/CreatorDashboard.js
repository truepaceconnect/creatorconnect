'use client'
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { FiUpload, FiX, FiCheck, FiLoader } from "react-icons/fi";
import { auth } from '@/app/(auth)/firebase/ClientApp';
import VideoUpload from '@/component/BeyondUploads/VideoUpload';
import ArticleUpload from '@/component/BeyondUploads/ArticleUpload';


const CreatorDashboard = ({ channel }) => {
  const [activeTab, setActiveTab] = useState("headline");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    message: '',
    image: null,
    imagePreview: null,
    isJustIn: true,
    tags: []
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };



  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('message', formData.message);
      if (formData.image) {
        formDataToSend.append('file', formData.image);
      }
      formDataToSend.append('isJustIn', formData.isJustIn);
      
      // Debug log to check tags before sending
      // console.log('Tags before sending:', formData.tags);
      
      // Modify how we append tags
      if (formData.tags.length > 0) {
        formData.tags.forEach(tag => {
          formDataToSend.append('tags', tag); // Changed from 'tags[]' to 'tags'
          // console.log('Appending tag:', tag);
        });
      }

      // Debug log to check FormData
      // for (let pair of formDataToSend.entries()) {
      //   console.log(pair[0] + ', ' + pair[1]);
      // }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: formDataToSend
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create content');
      }

      const responseData = await response.json();
      // console.log('Server response:', responseData);
  
      setSuccess(true);
      // Reset form
      setFormData({
        message: '',
        image: null,
        imagePreview: null,
        isJustIn: true,
        tags: []
      });
  
      // Clear file input
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      // console.log('Adding new tag:', newTag); // Debug log
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => {
          const updatedTags = [...prev.tags, newTag];
          // console.log('Updated tags array:', updatedTags); // Debug log
          return {
            ...prev,
            tags: updatedTags
          };
        });
      }
      setTagInput('');
    }
  };
  
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="headline">Headline News</TabsTrigger>
                <TabsTrigger value="article">Article</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>

              <TabsContent value="headline">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="message">Headline Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter your headline news..."
                      className="min-h-[100px]"
                      required
                    />
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
                            <X className="h-3 w-3" />
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

                  <div className="space-y-2">
                    <Label htmlFor="image">Image Upload</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image').click()}
                      >
                        <FiUpload className="mr-2" />
                        Upload Image
                      </Button>
                      {formData.image && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formData.image.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeImage}
                          >
                            <FiX className="h-4 w-4" />
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="just-in"
                      checked={formData.isJustIn}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isJustIn: checked }))
                      }
                    />
                    <Label htmlFor="just-in">Publish as "Just In" news</Label>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <FiCheck className="h-4 w-4" />
                      <AlertDescription>Content published successfully!</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Content'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="article">
                <ArticleUpload/>
              </TabsContent>

              <TabsContent value="video">
              <VideoUpload/>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorDashboard;