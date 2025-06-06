import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane } from 'react-icons/fa';
import ImagePlaceholder from './ImagePlaceholder';

const ImageWithFallback = ({ userId, ...props }) => {
  const [imgSrc, setImgSrc] = useState(`/images/${userId}.webp`);
  
  const handleError = () => {
    setImgSrc(`/images/${userId}.png`);
  };

  return (
    <div className="flex-shrink-0" style={{ width: props.className?.includes('w-') ? '1.5rem' : '2rem', height: props.className?.includes('h-') ? '1.5rem' : '2rem' }}>
      <img 
        src={imgSrc} 
        onError={handleError}
        className={`w-full h-full object-cover ${props.className || ''}`}
        alt={props.alt || 'User avatar'}
      />
    </div>
  );
};

const Post = ({ id, content, imageUrl, userId, username, likes, comments, createdAt }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const renderComment = (comment) => (
    <div key={comment.id} className="text-sm flex items-center space-x-2">
      <ImageWithFallback 
        userId={comment.userId}
        alt="Commenter avatar"
        className="h-6 w-6 rounded-full object-cover"
      />
      <div>
        <span className="font-semibold mr-2">{comment.username}</span>
        <span>{comment.text}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-sm mb-4 max-w-xl mx-auto">
      {/* Post Header */}
      <div className="flex items-center p-3">
        <ImageWithFallback 
          userId={userId}
          alt="User avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="ml-3 font-semibold">{username}</span>
      </div>

      {/* Post Image */}
      <div className="relative">
        {isImageLoading && <ImagePlaceholder />}
        <img 
          src={imageUrl} 
          alt="Post content"
          className={`w-full object-cover ${isImageLoading ? 'hidden' : 'block'}`}
          onLoad={() => setIsImageLoading(false)}
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
        <div className="mt-1">
          <span className="font-semibold mr-2">{username}</span>
          <span>{content}</span>
        </div>

        {/* Comments Section */}
        {comments && comments.length > 0 && (
          <div className="mt-2">
            {showAllComments ? (
              // Show all comments
              <div className="space-y-2">
                {comments.map(renderComment)}
                <button 
                  className="text-gray-500 text-sm"
                  onClick={() => setShowAllComments(false)}
                >
                  Show less
                </button>
              </div>
            ) : (
              // Show preview and view more button
              <div className="space-y-2">
                {comments.slice(0, 2).map(renderComment)}
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