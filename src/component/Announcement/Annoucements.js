"use client"
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaThumbsUp } from 'react-icons/fa';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { onAuthStateChanged } from 'firebase/auth';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAnnouncements();
    }
  }, [currentUser]);

  const fetchAnnouncements = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const handleAddComment = async (announcementId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/announcements/${announcementId}/comment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: newComment })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setNewComment('');
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLikeComment = async (announcementId, commentId, isLiked) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/announcements/${announcementId}/comment/${commentId}/like`,
        {
          method: isLiked ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to like/unlike comment');
      }

      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to like/unlike comment:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <p>Please sign in to view announcements.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Announcements</h1>
      
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div 
            key={announcement._id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            {/* Announcement Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {announcement.important && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">
                      Important
                    </span>
                  )}
                  {announcement.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Posted by {announcement.createdBy} on{' '}
                  {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Announcement Content */}
            <div className="prose max-w-none mb-6">
              <p>{announcement.content}</p>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              
              {/* Add Comment */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-2"
                />
                <button
                  onClick={() => handleAddComment(announcement._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Comment
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {announcement.comments
                  .sort((a, b) => b.likes.length - a.likes.length)
                  .map((comment) => (
                    <div key={comment._id} className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
                      <img
                        src={comment.creatorId.photoURL || '/default-avatar.png'}
                        alt={comment.creatorId.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{comment.creatorId.displayName}</h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                        <button
                          onClick={() => handleLikeComment(
                            announcement._id,
                            comment._id,
                            comment.likes.includes(currentUser.uid)
                          )}
                          className={`flex items-center gap-1 mt-2 text-sm ${
                            comment.likes.includes(currentUser.uid)
                              ? 'text-blue-600'
                              : 'text-gray-500'
                          }`}
                        >
                          <FaThumbsUp className="w-4 h-4" />
                          <span>{comment.likes.length}</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}