const express = require('express');
const router = express.Router();
const PostRepository = require('../repositories/PostRepository');

router.get('/', (req, res) => {
    try {
        const posts = PostRepository.findAllOrderedByDate();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

module.exports = router; 