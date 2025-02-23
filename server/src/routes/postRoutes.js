const express = require('express');
const router = express.Router();
const DynamoPostRepository = require('../repositories/DynamoPostRepository');

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
        const { text, userId } = req.body;
        const postId = req.params.id;

        if (!text || !userId) {
            return res.status(400).json({ error: 'Text and userId are required' });
        }

        const comment = new Comment({
            text,
            userId,
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