const express = require('express');
const router = express.Router();
const DynamoPostRepository = require('../repositories/DynamoPostRepository');
const Comment = require('../models/Comment');
const DynamoUserRepository = require('../repositories/DynamoUserRepository');
const AIPostGenerationService = require('../services/ai/AIGenService');

// Handler function for getting all posts
const getAllPosts = async (req, res) => {
    try {
        const { startDate, startId } = req.query;
        const PAGE_SIZE = parseInt(process.env.POSTS_PAGE_SIZE) || 10; // Default to 10 if not set
        const result = await DynamoPostRepository.findAllOrderedByDate(
            PAGE_SIZE,
            startDate,
            startId
        );
        res.json(result);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// Get all posts - This is the only endpoint needed in production
router.get('/', getAllPosts);

// Development-only routes
if (process.env.ENABLE_DEV_ENDPOINTS === 'true') {
    // Rebuild the feed index 
    router.get('/rebuild-feed', async (req, res) => {
        try {
            const indexedCount = await DynamoPostRepository.rebuildFeedIndex();
            res.json({ 
                success: true, 
                message: `Successfully rebuilt feed index with ${indexedCount} posts` 
            });
        } catch (error) {
            console.error('Error rebuilding feed index:', error);
            res.status(500).json({ error: 'Failed to rebuild feed index' });
        }
    });

    // Get posts by user ID
    router.get('/user/:userId', async (req, res) => {
        try {
            const posts = await DynamoPostRepository.findByUserId(req.params.userId);
            res.json(posts);
        } catch (error) {
            console.error('Error fetching user posts:', error);
            res.status(500).json({ error: 'Failed to fetch user posts' });
        }
    });

    // Get single post by ID
    router.get('/:id', async (req, res) => {
        try {
            const post = await DynamoPostRepository.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json(post);
        } catch (error) {
            console.error('Error fetching post:', error);
            res.status(500).json({ error: 'Failed to fetch post' });
        }
    });

    
    // Add a comment to a post
    router.get('/:id/comments', async (req, res) => {
        try {
            const postId = req.params.id;
            
            // Get the post
            const post = await DynamoPostRepository.findById(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Get all users
            const users = await DynamoUserRepository.findAll();
            if (!users || users.length === 0) {
                return res.status(404).json({ error: 'No users found in the system' });
            }

            // Select a random user
            const randomIndex = Math.floor(Math.random() * users.length);
            const randomUser = users[randomIndex];

            // Generate comment using AIPostGenerationService
            const commentText = await AIPostGenerationService.generateCommentForPost(randomUser, post);

            // Create and save the comment
            const comment = new Comment({
                text: commentText,
                userId: randomUser.id,
                username: randomUser.username,
                postId: postId
            });

            await DynamoPostRepository.addComment(postId, comment);
            res.status(201).json(comment);
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    });
}

module.exports = {
    router,
    getAllPosts
}; 