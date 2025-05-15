'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreatorDashboard from '../creatordashboard/CreatorDashboard';
import { AiOutlineWarning } from 'react-icons/ai'; // Import the new icon

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [channelData, setChannelData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
          router.push('/');
          return;
        }

        // Verify creator status and fetch channel data
        const idToken = await user.getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/creators/verify`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to verify creator status');
        }

        const data = await response.json();
        setChannelData(data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AiOutlineWarning className="h-5 w-5" /> {/* Use the new icon */}
                <p>Error loading dashboard: {error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {channelData?.channel?.name}</h1>
          <p className="text-gray-600 mt-1">Manage your content and channel settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{channelData?.channel?.subscriberCount || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Count</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{channelData?.channel?.contentCount || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg. Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {channelData?.channel?.avgEngagementRate?.toFixed(1) || '0.0'}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList>
                <TabsTrigger value="create">Create Content</TabsTrigger>
                <TabsTrigger value="manage">Manage Content</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6">
                <CreatorDashboard channel={channelData?.channel} />
              </TabsContent>

              <TabsContent value="manage">
                <div className="py-8 text-center text-gray-500">
                  Content management features coming soon...
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="py-8 text-center text-gray-500">
                  Analytics dashboard coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
