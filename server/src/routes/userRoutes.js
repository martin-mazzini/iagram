const express = require('express');
const router = express.Router();
const DynamoUserRepository = require('../repositories/DynamoUserRepository');
const DynamoPostRepository = require('../repositories/DynamoPostRepository');
const AIPostGenerationService = require('../services/ai/AIPostGenerationService');
const Comment = require('../models/Comment');

router.get('/', async (req, res) => {
    try {
        const users = await DynamoUserRepository.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// New endpoint to generate a post for a specific user
router.get('/:userId/post', async (req, res) => {
    try {
        console.log('\n=== Post Generation Request ===');
        console.log('Requested for userId:', req.params.userId);
        
        const user = await DynamoUserRepository.findById(req.params.userId);
        
        if (!user) {
            console.log('User not found:', req.params.userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Found user:', user.id);
        const generatedPost = await AIPostGenerationService.generatePostForUser(user);
        
        console.log('\n=== Post Generation Complete ===');
        console.log('Generated post:', generatedPost);
        
        res.status(201).json(generatedPost);
    } catch (error) {
        console.error('Error in post generation endpoint:', error);
        res.status(500).json({ error: 'Failed to generate post' });
    }
});

// Modified endpoint to generate and post a comment on a specific friend's post
router.get('/:userId/comment/:friendId', async (req, res) => {
    try {
        console.log('\n=== Comment Generation Request ===');
        console.log('Requested for userId:', req.params.userId);
        console.log('Target friendId:', req.params.friendId);
        
        // Get the user
        const user = await DynamoUserRepository.findById(req.params.userId);
        if (!user) {
            console.log('User not found:', req.params.userId);
            return res.status(404).json({ error: 'User not found' });
        }

        // Get friend's posts
        const friendPosts = await DynamoPostRepository.findByUserId(req.params.friendId);
        if (!friendPosts || !friendPosts.length) {
            return res.status(404).json({ error: 'No posts found from friend' });
        }

        // Select the most recent post
        if (!friendPosts.length) {
            return res.status(404).json({ error: 'No posts found from friends' });
        }
        const targetPost = friendPosts[0];

        // Generate comment using AI
        const commentText = await AIPostGenerationService.generateCommentForPost(user, targetPost);

        // Create and save the comment
        const comment = new Comment({
            text: commentText,
            userId: user.id,
            username: user.username,
            postId: targetPost.id
        });

        await DynamoPostRepository.addComment(targetPost.id, comment);
        
        console.log('\n=== Comment Generation Complete ===');
        console.log('Generated comment:', comment);
        
        res.status(201).json({
            comment,
            postId: targetPost.id,
            friendId: req.params.friendId
        });
    } catch (error) {
        console.error('Error in comment generation endpoint:', error);
        res.status(500).json({ error: 'Failed to generate and post comment' });
    }
});

module.exports = router; 