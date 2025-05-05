const express = require('express');
const router = express.Router();
const DynamoUserRepository = require('../repositories/DynamoUserRepository');
const DynamoPostRepository = require('../repositories/DynamoPostRepository');
const AIPostGenerationService = require('../services/ai/AIGenService');
const UserGenerationService = require('../services/ai/UserGenerationService');
const Comment = require('../models/Comment');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const CommentGenerationService = require('../services/ai/CommentGenerationService');

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
        
        const result = await CommentGenerationService.generateCommentForFriend(
            req.params.userId, 
            req.params.friendId
        );
        
        console.log('\n=== Comment Generation Complete ===');
        console.log('Generated comment:', result.comment);
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in comment generation endpoint:', error);
        res.status(500).json({ error: 'Failed to generate and post comment' });
    }
});

// Generate a new AI user
router.get('/generate', async (req, res) => {
    try {
        console.log('\n=== AI User Generation Request ===');
        
        const savedUser = await UserGenerationService.generateUser();
        
        console.log('\n=== User Generation Complete ===');
        
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error generating user:', error);
        res.status(500).json({ error: 'Failed to generate user' });
    }
});

// Generate multiple AI users
router.post('/generate/batch', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
        if (count < 1 || count > 10) {
            return res.status(400).json({ error: 'Count must be between 1 and 10' });
        }

        console.log(`\n=== Generating ${count} AI Users ===`);
        
        const generatedUsers = [];
        for (let i = 0; i < count; i++) {
            const userProfile = await AIPostGenerationService.generateUserProfile();
            const user = new User(userProfile);
            const savedUser = await DynamoUserRepository.create(user);
            generatedUsers.push(savedUser);
        }
        
        console.log(`\n=== Generated ${count} Users Successfully ===`);
        res.status(201).json(generatedUsers);
    } catch (error) {
        console.error('Error generating users:', error);
        res.status(500).json({ error: 'Failed to generate users' });
    }
});

module.exports = router; 