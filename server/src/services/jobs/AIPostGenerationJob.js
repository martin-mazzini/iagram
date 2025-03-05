const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const AIPostGenerationService = require('../ai/AIPostGenerationService');

class AIPostGenerationJob {
    static async execute() {
        try {
            console.log('\n=== Executing AI Post Generation Job ===');
            console.log('Time:', new Date().toISOString());
            
            // Get all users
            const users = await DynamoUserRepository.findAll();
            
            if (!users || users.length === 0) {
                console.log('No users found. Skipping post generation.');
                return;
            }
            
            // Select a random user
            const randomIndex = Math.floor(Math.random() * users.length);
            const selectedUser = users[randomIndex];
            
            console.log(`Selected random user: ${selectedUser.username} (${selectedUser.id})`);
            
            // Generate a post for the selected user
            const generatedPost = await AIPostGenerationService.generatePostForUser(selectedUser);
            
            console.log(`Successfully generated post: ${generatedPost.id}`);
            console.log('Post content:', generatedPost.content.substring(0, 100) + '...');
            console.log('=== AI Post Generation Job Completed ===\n');
            
            return generatedPost;
        } catch (error) {
            console.error('Error in AI Post Generation Job:', error);
        }
    }
}

module.exports = AIPostGenerationJob; 