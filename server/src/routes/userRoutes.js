const express = require('express');
const router = express.Router();
const DynamoUserRepository = require('../repositories/DynamoUserRepository');
const AIPostGenerationService = require('../services/ai/AIPostGenerationService');

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

module.exports = router; 