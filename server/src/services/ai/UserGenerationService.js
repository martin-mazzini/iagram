const User = require('../../models/User');
const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const AIPostGenerationService = require('./AIPostGenerationService');
const OpenAIClient = require('./OpenAIClient');
const S3ImageRepository = require('../../repositories/S3ImageRepository');

class UserGenerationService {
    static async generateUser() {
        // Generate user profile using AI
        const userProfile = await AIPostGenerationService.generateUserProfile();
        
        // Create new User instance
        const user = new User(userProfile);
        
        // Generate profile picture
        const openaiClient = new OpenAIClient();
        const profilePicPrompt = `Generate a profile picture for a social media user with the following characteristics:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Nationality: ${userProfile.nationality}
- Socioeconomic Status: ${userProfile.socioeconomicStatus}
- Interests: ${userProfile.interests.join(', ')}

The image should be suitable for a small profile picture, reflect the user charachteristic, and MOST IMPORTANTLY,
 be a realistic profile pic that a person would use on Instagram. It doesn't neccesarily have to reflect the person hobbies or interests, but it can if it would be realistic for the picture.`;
        await openaiClient.generateImage(profilePicPrompt, "1024x1024", user.id);
        
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