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
            const response = await this.openAIClient.generateResponse(prompt, {
                max_tokens: 200,
                temperature: 0.8 // Slightly higher for more creative responses
            });

            const post = new Post({
                content: response.content,
                imageUrl: null, // We'll handle image generation later
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
}

module.exports = new AIPostGenerationService(); 