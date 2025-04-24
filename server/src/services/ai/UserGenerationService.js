const User = require('../../models/User');
const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const AIPostGenerationService = require('./AIPostGenerationService');
const OpenAIClient = require('./OpenAIClient');
const StabilityAIClient = require('./StabilityAIClient');
const S3ImageRepository = require('../../repositories/S3ImageRepository');

class UserGenerationService {

    constructor() {
        this.openaiClient = new OpenAIClient();
        this.stabilityClient = new StabilityAIClient();
        this.imageProvider = process.env.IMAGE_PROVIDER
    }


    async generateUser() {
        // Generate user profile using AI
        const userProfile = await AIPostGenerationService.generateUserProfile();
        
        // Create new User instance
        const user = new User(userProfile);

        try {
            const prompt = `Generate a profile photo for an Instagram user with the following characteristics:
            - Age: ${userProfile.age}
            - Gender: ${userProfile.gender}
            - Nationality: ${userProfile.nationality}
            - Socioeconomic Status: ${userProfile.socioeconomicStatus}
        
            . Do not include any UI, frames, logos, text, or other elements. THE IMAGE IS JUST A PHOTO taken with a cellphone.`;
                // Choose the image generation provider based on environment variable
            if (this.imageProvider === 'STABILITYAI') {
                await this.stabilityClient.generateImage(prompt, user.id)
            } else if (this.imageProvider === 'OPENAI') {
                await this.openaiClient.generateImage(prompt, "1024x1024", user.id);
            } else {
                // This should never happen due to validation in constructor
                throw new Error(`Unsupported image provider: ${this.imageProvider}`);
            }
        } catch (error) {
                console.error('Image Generation Error:', error);
                throw new Error(`Failed to generate image using ${this.imageProvider}`);
        }
        

        
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

module.exports = new UserGenerationService(); 