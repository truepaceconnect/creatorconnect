'use client'
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from '@/app/(auth)/firebase/ClientApp';
import VideoUpload from '@/component/BeyondUploads/VideoUpload';
import ArticleUpload from '@/component/BeyondUploads/ArticleUpload';
import HeadlineUpload from '@/component/BeyondUploads/HeadlineUpload';

const CreatorDashboard = ({ channel }) => {
  const [activeTab, setActiveTab] = useState("headline");
  
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
                <HeadlineUpload />
              </TabsContent>

              <TabsContent value="article">
                <ArticleUpload />
              </TabsContent>

              <TabsContent value="video">
                <VideoUpload />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorDashboard;