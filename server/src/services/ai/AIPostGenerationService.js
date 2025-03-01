const OpenAIClient = require('./OpenAIClient');
const Post = require('../../models/Post');
const DynamoPostRepository = require('../../repositories/DynamoPostRepository');

class AIPostGenerationService {
    constructor() {
        this.openAIClient = new OpenAIClient();
    }

    async generatePostForUser(user) {
        const prompt = this._createPromptFromUser(user);
        
        try {
            // Generate both text content and photo description
            const response = await this.openAIClient.generateResponse(prompt, {
                max_tokens: 300,
                temperature: 0.8
            });

            // Parse the JSON response
            const parsedResponse = JSON.parse(response.content);
            
            // Generate image based on the photo description
            const imageUrl = await this.openAIClient.generateImage(parsedResponse.photo);

            const post = new Post({
                content: parsedResponse.content,
                imageUrl: imageUrl,
                userId: user.id,
                username: user.username
            });

            // Save to DynamoDB
            return DynamoPostRepository.create(post);
        } catch (error) {
            console.error('Error generating post:', error);
            throw new Error('Failed to generate post content');
        }
    }

    _createPromptFromUser(user) {
        return `Create a realistic Instagram post for a user. Special emphasis on realistic, Instagram posts are not always aesthetic, or perfectly worded, or with no grammar mistakes. Think of REAL instagram posts, for a user with the following characteristics. Note: The POST doesn't necessarily have to be related to the User interests, it's just background context. Note 2: You don't ALWAYS have to include emojis or hashtags, you can if you feel it suits the realistic tone.
The output should be valid JSON with two keys:
photo: a description of the photo that would accompany the post.
content: the Post text content.

The user in question has the following characteristics:
${JSON.stringify(user, null, 2)}`;
    }

    _createImagePromptFromContent(content, user) {
        return `Create an image for an Instagram post by a ${user.interests[0]} enthusiast. 
The post content is: "${content}"

The image should:
- Be a realistic Instagram post image (so not overly professional except if it's a professional product)
- Should look like a photo taken from a cellphone 
- Match the mood and topic of the post
- Look authentic and personal
- Reflect the user's interests: ${user.interests.join(', ')}`;
    }

    async generateCommentForPost(user, post) {
        const prompt = this._createCommentPrompt(user, post);
        
        try {
            const response = await this.openAIClient.generateResponse(prompt, {
                max_tokens: 100,
                temperature: 0.8
            });

            return response.content;
        } catch (error) {
            console.error('Error generating comment:', error);
            throw new Error('Failed to generate comment');
        }
    }

    _createCommentPrompt(user, post) {
        return `Generate a realistic, engaging Instagram comment for a user responding to their friend's post.

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

Generate only the comment text, no additional explanations.`;
    }

    async generateUserProfile() {
        try {
            const userData = await this.openAIClient.generateUserProfile();
            
            // Transform the AI response into our User model format
            const userModelData = {
                id: require('uuid').v4(),
                username: userData.instagram_username,
                age: userData.age,
                gender: userData.gender,
                personality: userData.personality,
                biography: userData.biography,
                nationality: userData.nationality,
                socioeconomicStatus: userData['socioeconomic_status'],
                politicalOrientation: userData['political_orientation'],
                interests: Array.isArray(userData.interests) ? userData.interests : [userData.interests],
                friends: []
            };

            return userModelData;
        } catch (error) {
            console.error('Error in generateUserProfile:', error);
            throw new Error('Failed to generate user profile');
        }
    }
}

module.exports = new AIPostGenerationService();