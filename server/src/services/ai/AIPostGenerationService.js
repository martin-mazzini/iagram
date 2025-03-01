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
                max_tokens: parseInt(process.env.MAX_TOKENS_POST) || 300,
                temperature: 0.8
            });

            console.log('Raw AI Response:', response.content);

            // Parse the JSON response
            let parsedResponse;
            try {
                // Clean the response in case it contains markdown or extra text
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
            const imageUrl = await this.openAIClient.generateImage(imagePrompt);

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
            throw new Error(`Failed to generate post content: ${error.message}`);
        }
    }

    _createPromptFromUser(user) {
        return `Create a realistic Instagram post for a user. Special emphasis on realistic, Instagram posts are not always aesthetic, or perfectly worded, or with no grammar mistakes. Think of REAL instagram posts, for a user with the following characteristics. Note: The POST doesn't necessarily have to be related to the User interests, it's just background context. Note 2: You don't ALWAYS have to include emojis or hashtags, you can if you feel it suits the realistic tone.

Important: Return ONLY valid JSON, no markdown formatting or additional text.

The output should be valid JSON with two keys:
photo: a description of the photo that would accompany the post.
content: the Post text content.

The user in question has the following characteristics:
${JSON.stringify(user, null, 2)}`;
    }

    
    async generateCommentForPost(user, post) {
        const prompt = this._createCommentPrompt(user, post);
        
        try {
            const response = await this.openAIClient.generateResponse(prompt, {
                max_tokens: parseInt(process.env.MAX_TOKENS_COMMENT) || 100,
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
        const prompt = `Generate a possible human character by filling the following fields. Output should be JSON format with the respective keys:
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

Important: Return ONLY valid JSON, no markdown formatting or additional text.`;

        try {
            const response = await this.openAIClient.generateResponse(prompt, {
                max_tokens: parseInt(process.env.MAX_TOKENS_PROFILE) || 1000,
                temperature: 0.8
            });
            
            console.log('Raw AI Response:', response.content);
            
            let userData;
            try {
                // Clean the response in case it contains markdown or extra text
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

            // Validate required fields
            const requiredFields = ['age', 'gender', 'personality', 'biography', 'nationality', 'interests', 'instagram_username'];
            const missingFields = requiredFields.filter(field => !userData[field]);
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Transform the AI response into our User model format
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
}

module.exports = new AIPostGenerationService();