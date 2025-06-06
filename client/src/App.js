import React, { useState, useEffect, useCallback } from 'react';
import Post from './components/Post';
import Spinner from './components/Spinner';
import Banner from './components/Banner';
import api from './services/api';

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextStartDate, setNextStartDate] = useState(null);
  const [nextStartId, setNextStartId] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await api.getPosts(
        isInitial ? null : nextStartDate,
        isInitial ? null : nextStartId
      );

      if (isInitial) {
        setPosts(result.posts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...result.posts]);
      }

      setHasMore(result.hasMore);
      setNextStartDate(result.nextStartDate);
      setNextStartId(result.nextStartId);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [nextStartDate, nextStartId]);

  useEffect(() => {
    fetchPosts(true);
  },[]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 50
    ) {
      if (hasMore && !isLoadingMore) {
        fetchPosts(false);
      }
    }
  }, [hasMore, isLoadingMore, fetchPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Banner />
      <div className="max-w-screen-md mx-auto pt-12 sm:pt-14">
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="text-center text-gray-500 py-4">
            No more posts to load
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 