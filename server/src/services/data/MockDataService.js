const User = require('../../models/User');
const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const AIPostGenerationService = require('../ai/AIPostGenerationService');

class MockDataService {
    static async initializeMockData() {
        console.log('Initializing AI-generated users in DynamoDB...');
        
        try {
            // Generate 2 users using AI
            const userProfiles = await Promise.all([
                AIPostGenerationService.generateUserProfile(),
                AIPostGenerationService.generateUserProfile()
            ]);

            const users = userProfiles.map(profile => new User(profile));
            
            // Create friendship connections between the two users
            users[0].addFriend(users[1].id);
            users[1].addFriend(users[0].id);

            // Save users to DynamoDB
            for (const user of users) {
                await DynamoUserRepository.create(user);
                console.log(`Created AI-generated user in DynamoDB: ${user.id} (${user.username})`);
                console.log('User details:', JSON.stringify(user, null, 2));
            }

            console.log(`Initialized ${users.length} AI-generated users in DynamoDB`);
            return users;
        } catch (error) {
            console.error('Error initializing AI-generated mock data:', error);
            throw error;
        }
    }
}

module.exports = MockDataService; 