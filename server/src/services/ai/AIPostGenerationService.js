const OpenAIClient = require('./OpenAIClient');
const Post = require('../../models/Post');
const PostRepository = require('../../repositories/PostRepository');

class AIPostGenerationService {
    constructor() {
        this.openAIClient = new OpenAIClient();
    }

    async generatePostForUser(user) {
        const prompt = this._createPromptFromUser(user);
        
        try {
            // Generate text content first
            const textResponse = await this.openAIClient.generateResponse(prompt, {
                max_tokens: 200,
                temperature: 0.8
            });

            // Generate image based on the text content
            const imagePrompt = this._createImagePromptFromContent(textResponse.content, user);
            const imageUrl = await this.openAIClient.generateImage(imagePrompt);

            const post = new Post({
                content: textResponse.content,
                imageUrl: imageUrl,
                userId: user.id
            });

            return PostRepository.create(post);
        } catch (error) {
            console.error('Error generating post:', error);
            throw new Error('Failed to generate post content');
        }
    }

    _createPromptFromUser(user) {
        return `Create a realistic, engaging Instagram post for a user with the following characteristics:

Personality: ${user.personality}
Biography: ${user.biography}
Interests: ${user.interests.join(', ')}

The post should:
- Be written in first person
- Match the user's personality and tone
- Include relevant emojis
- Be between 1-3 sentences
- Potentially include 1-2 relevant hashtags
- Feel authentic and personal
- Relate to one or more of their interests

Generate only the post content, no additional explanations.`;
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
}

module.exports = new AIPostGenerationService();