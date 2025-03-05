const express = require('express');
const router = express.Router();
const DynamoPostRepository = require('../repositories/DynamoPostRepository');
const Comment = require('../models/Comment');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await DynamoPostRepository.findAllOrderedByDate();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Rebuild the feed index (admin operation)
// This needs to be BEFORE the /:id route to avoid being caught as a post ID
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
router.post('/:id/comments', async (req, res) => {
    try {
        const { text, userId, username } = req.body;
        const postId = req.params.id;

        if (!text || !userId || !username) {
            return res.status(400).json({ error: 'Text, userId, and username are required' });
        }

        const comment = new Comment({
            text,
            userId,
            username,
            postId
        });

        await DynamoPostRepository.addComment(postId, comment);
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

module.exports = router; 