const User = require('../../models/User');
const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const AIPostGenerationService = require('./AIPostGenerationService');

class UserGenerationService {
    static async generateUser() {
        // Generate user profile using AI
        const userProfile = await AIPostGenerationService.generateUserProfile();
        
        // Create new User instance
        const user = new User(userProfile);
        
        // Get random friend IDs
        const randomFriendIds = await DynamoUserRepository.getRandomPotentialFriendIds(user.id);
        
        // Add the friend IDs to the user's friends array
        if (!user.friends) {
            user.friends = [];
        }
        user.friends.push(...randomFriendIds);
        
        // Save to DynamoDB with friends already added
        const savedUser = await DynamoUserRepository.create(user);
        
        console.log('Generated user with friends:', savedUser.username);
        
        return savedUser;
    }
}

module.exports = UserGenerationService; 