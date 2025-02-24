import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';

const Post = ({ id, content, imageUrl, userId, likes, comments, createdAt }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [showAllComments, setShowAllComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm mb-4 max-w-xl mx-auto">
      {/* Post Header */}
      <div className="flex items-center p-3">
        <img 
          src={`https://i.pravatar.cc/150?u=${userId}`}
          alt="User avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="ml-3 font-semibold">User {userId}</span>
      </div>

      {/* Post Image */}
      <div className="relative">
        <img 
          src={imageUrl} 
          alt="Post content"
          className="w-full object-cover"
          onDoubleClick={handleLike}
        />
      </div>

      {/* Post Actions */}
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button onClick={handleLike}>
              {isLiked ? (
                <FaHeart className="h-6 w-6 text-red-500" />
              ) : (
                <FaRegHeart className="h-6 w-6" />
              )}
            </button>
            <button>
              <FaRegComment className="h-6 w-6" />
            </button>
            <button>
              <FaRegPaperPlane className="h-6 w-6" />
            </button>
          </div>
          <button onClick={() => setIsSaved(!isSaved)}>
            {isSaved ? (
              <FaBookmark className="h-6 w-6" />
            ) : (
              <FaRegBookmark className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Likes */}
        <div className="mt-2">
          <span className="font-semibold">{likesCount.toLocaleString()} likes</span>
        </div>

        {/* Caption */}
        <div className="mt-1 px-3">
          <span className="font-semibold mr-2">User {userId.slice(0, 8)}</span>
          <span>{content}</span>
        </div>

        {/* Comments Section */}
        {comments && comments.length > 0 && (
          <div className="mt-2 px-3">
            {showAllComments ? (
              // Show all comments
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-semibold mr-2">{comment.userId}</span>
                    <span>{comment.content}</span>
                  </div>
                ))}
                <button 
                  className="text-gray-500 text-sm"
                  onClick={() => setShowAllComments(false)}
                >
                  Show less
                </button>
              </div>
            ) : (
              // Show preview and view more button
              <div>
                {/* Preview first two comments */}
                <div className="space-y-2">
                  {comments.slice(0, 2).map((comment, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-semibold mr-2">{comment.userId}</span>
                      <span>{comment.content}</span>
                    </div>
                  ))}
                </div>
                {comments.length > 2 && (
                  <button 
                    className="text-gray-500 text-sm"
                    onClick={() => setShowAllComments(true)}
                  >
                    View all {comments.length} comments
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-2 px-3 text-xs text-gray-500 uppercase">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 border-none focus:ring-0 outline-none"
          />
          <button className="text-blue-500 font-semibold opacity-50">Post</button>
        </div>
      </div>
    </div>
  );
};

export default Post; 