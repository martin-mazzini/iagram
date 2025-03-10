const OpenAIClient = require('./OpenAIClient');
const StabilityAIClient = require('./StabilityAIClient');
const Post = require('../../models/Post');
const User = require('../../models/User');
const { v4: uuidv4 } = require('uuid');
const DynamoPostRepository = require('../../repositories/DynamoPostRepository');

// Prompts as constants
const PROMPTS = {
    POST: (user, minChars) => `Create a realistic Instagram post for a specific user given his personality and interests. Special emphasis on realistic, Instagram posts are not always aesthetic, or perfectly worded, or with no grammar mistakes. Think of REAL instagram posts, for a user with the following characteristics. Note: The POST doesn't necessarily have to be related to the User interests, it's just background context. Note 2: You don't ALWAYS have to include emojis or hashtags, you can if you feel it suits the realistic tone.

Important: Return ONLY valid JSON, no markdown formatting or additional text.
Important: The content field should be AT LEAST ${minChars} characters long.

The output should be valid JSON with two keys:
photo: a description of the photo that would accompany the post.
content: the Post text content (minimum ${minChars} characters).

The user in question has the following characteristics. This is only for context, so you generate an appropiate post, but take it only as a guideline. No need to perfectly match the interests or personality.
${JSON.stringify(user, null, 2)}`,

    COMMENT: (user, post) => `Generate a realistic, authentic Instagram comment for a user responding to their friend's post. Comment doesn't always need to be positive, or 
    happy, or agreeable. It can be negative, or sarcastic, or even offensive, depending on the user's personality and the post content.

User characteristics:
Personality: ${user.personality}
Interests: ${user.interests.join(', ')}

Friend's post content:
"${post.content}"

The comment should:
- Be written in a casual, social media style
- Match the user's personality and tone
- Be between 1-2 sentences
- Potentially include 1-2 relevant emojis
- Feel authentic and personal
- Show genuine engagement with the post content
- Avoid generic responses like "Great post!" or "Nice!"

Generate only the comment text, no additional explanations.`,

    USER_PROFILE: `Generate a possible human character by filling the following fields. 
    Generate a truly random personality, it can have negative traits (be aggresive, conservative, etc). Don't only generate liberal woman. Output should be JSON format with the respective keys:
age:
gender:
personality: A short description of psychology, base yourself on the Big Five.
biography: A short biography
socioeconomic_status:
political_orientation:
nationality:
interests:
name:
instagram_username:

Important: Return ONLY valid JSON, no markdown formatting or additional text.
Important: Both personality and biography fields must be at least ${process.env.MIN_USER_CHARS || 200} characters long.`
};

class AIPostGenerationService {
    constructor() {
        this.openaiClient = new OpenAIClient();
        this.stabilityClient = new StabilityAIClient();
        this.imageProvider = process.env.IMAGE_PROVIDER
    }

    async generatePostForUser(user) {
        const minChars = parseInt(process.env.MIN_POST_CHARS) || 50;
        const prompt = PROMPTS.POST(user, minChars);
        
        try {
            // Generate both text content and photo description
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: parseInt(process.env.MAX_TOKENS_POST) || 300,
                temperature: 0.8
            });

            console.log('Raw AI Response:', response.content);

            // Parse the JSON response
            let parsedResponse;
            try {
                const possibleJson = response.content.replace(/```json\n?|\n?```/g, '').trim();
                parsedResponse = JSON.parse(possibleJson);
            } catch (parseError) {
                console.error('Parse Error:', parseError);
                console.error('Invalid JSON received from ChatGPT:', response.content);
                throw new Error('Failed to parse AI response as JSON');
            }
            
            // Generate image based on the photo description
            const imagePrompt = `Generate a realistic photo of: ${parsedResponse.photo}, as it would be
            taken by someone with the following characteristics: ${JSON.stringify(user, null, 2)}`;
            const imageUrl = await this.generateImage(imagePrompt);

            const post = new Post({
                content: parsedResponse.content,
                imageUrl: imageUrl,
                userId: user.id,
                username: user.username
            });

            return DynamoPostRepository.create(post);
        } catch (error) {
            console.error('Error generating post:', error);
            throw new Error(`Failed to generate post content: ${error.message}`);
        }
    }

    async generateCommentForPost(user, post) {
        const prompt = PROMPTS.COMMENT(user, post);
        
        try {
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: parseInt(process.env.MAX_TOKENS_COMMENT) || 100,
                temperature: 0.8
            });

            return response.content;
        } catch (error) {
            console.error('Error generating comment:', error);
            throw new Error('Failed to generate comment');
        }
    }

    async generateUserProfile() {
        try {
            const response = await this.openaiClient.generateResponse(PROMPTS.USER_PROFILE, {
                max_tokens: parseInt(process.env.MAX_TOKENS_PROFILE) || 1000,
                temperature: 0.8
            });
            
            console.log('Raw AI Response:', response.content);
            
            let userData;
            try {
                const possibleJson = response.content.replace(/```json\n?|\n?```/g, '').trim();
                userData = JSON.parse(possibleJson);
            } catch (parseError) {
                console.error('Parse Error:', parseError);
                console.error('Invalid JSON received from ChatGPT:', response.content);
                throw new Error('Failed to parse AI response as JSON');
            }
            
            if (!userData || typeof userData !== 'object') {
                throw new Error('AI response is not a valid object');
            }

            const requiredFields = ['age', 'gender', 'personality', 'biography', 'nationality', 'interests', 'instagram_username'];
            const missingFields = requiredFields.filter(field => !userData[field]);
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const userModelData = {
                id: require('uuid').v4(),
                username: userData.instagram_username,
                age: userData.age,
                gender: userData.gender,
                personality: userData.personality,
                biography: userData.biography,
                nationality: userData.nationality,
                socioeconomicStatus: userData['socioeconomic_status'] || 'middle_class',
                politicalOrientation: userData['political_orientation'] || 'moderate',
                interests: Array.isArray(userData.interests) ? userData.interests : [userData.interests],
                friends: []
            };

            return userModelData;
        } catch (error) {
            console.error('Error in generateUserProfile:', error);
            throw new Error(`Failed to generate user profile: ${error.message}`);
        }
    }

    async generateImage(prompt) {
        try {
            // Choose the image generation provider based on environment variable
            if (this.imageProvider === 'STABILITYAI') {
                return await this.stabilityClient.generateImage(prompt);
            } else if (this.imageProvider === 'OPENAI') {
                return await this.openaiClient.generateImage(prompt);
            } else {
                // This should never happen due to validation in constructor
                throw new Error(`Unsupported image provider: ${this.imageProvider}`);
            }
        } catch (error) {
            console.error('Image Generation Error:', error);
            throw new Error(`Failed to generate image using ${this.imageProvider}`);
        }
    }
}

module.exports = new AIPostGenerationService();