"use client"
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaThumbsUp, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { auth } from '@/app/(auth)/firebase/ClientApp';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isFounder, setIsFounder] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', important: false });

  const founderUids = ['u7NvqBzv7mc905ixY1Ka2RgQRTS2', 'TZ9xW6r0EFgd7CQDrOwfe2DZRFB2'];
  const COMMENTS_PREVIEW_LENGTH = 3;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsFounder(founderUids.includes(user.uid));
      }
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
      
      if (!response.ok) throw new Error('Failed to fetch announcements');
      
      const data = await response.json();
      setAnnouncements(data);
      
      // Initialize expanded state for all announcements
      const expandedState = {};
      data.forEach(announcement => {
        expandedState[announcement._id] = false;
      });
      setExpandedComments(expandedState);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const toggleComments = (announcementId) => {
    setExpandedComments(prev => ({
      ...prev,
      [announcementId]: !prev[announcementId]
    }));
  };


  const handleAddComment = async (announcementId, event) => {
    if (event && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await submitComment(announcementId);
    }
  };

  const submitComment = async (announcementId) => {
    if (!newComment.trim()) return;
    
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

      if (!response.ok) throw new Error('Failed to add comment');

      setNewComment('');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!isFounder) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/announcements/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newAnnouncement)
        }
      );

      if (!response.ok) throw new Error('Failed to create announcement');

      setNewAnnouncement({ title: '', content: '', important: false });
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };


  const handleLikeComment = async (announcementId, commentId, isLiked) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const action = isLiked ? 'unlike' : 'like';
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/announcements/${announcementId}/comments/${commentId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) throw new Error(`Failed to ${action} comment`);
      
      // Refresh announcements to get updated like count
      await fetchAnnouncements();
    } catch (error) {
      console.error(`Failed to ${isLiked ? 'unlike' : 'like'} comment:`, error);
    }
  }

  

  const renderComments = (announcement) => {
    const sortedComments = announcement.comments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const displayComments = expandedComments[announcement._id] 
      ? sortedComments 
      : sortedComments.slice(0, COMMENTS_PREVIEW_LENGTH);

    return (
      <>
        <div className="space-y-4">
          {displayComments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="relative w-10 h-10 overflow-hidden rounded-full">
                <Image
                  src={comment.creatorId?.channelId?.picture || '/NopicAvatar.png'}
                  alt={comment.creatorId?.displayName || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{comment.creatorId?.displayName}</h4>
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
                  className={`flex items-center gap-1 mt-2 text-sm transition-colors duration-200
                    ${comment.likes.includes(currentUser.uid)
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-gray-500 hover:text-gray-600'
                    }`}
                >
                  <FaThumbsUp className={`w-4 h-4 ${
                    comment.likes.includes(currentUser.uid) ? 'fill-current' : 'stroke-current'
                  }`} />
                  <span>{comment.likes.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {announcement.comments.length > COMMENTS_PREVIEW_LENGTH && (
          <button
            onClick={() => toggleComments(announcement._id)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4 transition-colors duration-200"
          >
            {expandedComments[announcement._id] ? (
              <>
                <FaChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <FaChevronDown className="w-4 h-4" />
                Show More ({announcement.comments.length - COMMENTS_PREVIEW_LENGTH} more)
              </>
            )}
          </button>
        )}
      </>
    );
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
      
      {/* Announcement Creation Form - Only visible to founders */}
      {isFounder && (
        <form onSubmit={handleCreateAnnouncement} className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Announcement Title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Announcement Content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2 h-32"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="important"
                checked={newAnnouncement.important}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, important: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="important">Mark as Important</label>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Announcement
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div 
            key={announcement._id}
            className="bg-white rounded-lg shadow-md p-6"
          >
         {/* Announcement header and content */}
         <div className="mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">
          {announcement.important && 
            <span className="text-red-600 mr-2">⚠️</span>
          }
          {announcement.title}
        </h2>
        <span className="text-sm text-gray-500">
          {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
        </span>
      </div>
      <div className="text-gray-700 whitespace-pre-wrap">
        {announcement.content}
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Posted by {announcement.createdBy}
      </div>
    </div>

             {/* Comments section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => handleAddComment(announcement._id, e)}
                  className="flex-1 border rounded-lg px-4 py-2"
                />
                <button
                  onClick={() => submitComment(announcement._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Comment
                </button>
              </div>

              {renderComments(announcement)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}