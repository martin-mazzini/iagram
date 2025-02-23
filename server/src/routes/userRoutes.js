const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');
const AIPostGenerationService = require('../services/ai/AIPostGenerationService');

router.get('/', (req, res) => {
    const users = UserRepository.findAll();
    res.json(users);
});

// New endpoint to generate a post for a specific user
router.get('/:userId/post', async (req, res) => {
    try {
        console.log('\n=== Post Generation Request ===');
        console.log('Requested for userId:', req.params.userId);
        
        const user = UserRepository.findById(req.params.userId);
        
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