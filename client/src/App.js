import React from 'react';
import Post from './components/Post';
import { posts } from './data/mockData';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-md mx-auto pt-8">
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}

export default App; 