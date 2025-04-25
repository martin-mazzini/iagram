const OpenAIClient = require('./OpenAIClient');
const StabilityAIClient = require('./StabilityAIClient');
const Post = require('../../models/Post');
const User = require('../../models/User');
const { v4: uuidv4 } = require('uuid');
const DynamoPostRepository = require('../../repositories/DynamoPostRepository');

// Prompts as constants
const PROMPTS = {
    POST: (user, chars) => `Create a realistic Instagram post for a specific based on all the user characteristics. 
    Your goal is to deeply *impersonate* this user — not just simulate an idealized post, but to generate something they would realistically share, based on how they think, feel, and behave. Their tone might be aesthetic or chaotic, emotional or ironic, awkward or eloquent — *whatever fits the actual personality traits*.
    The post should feel like something posted by a *real person*, not a bot or a brand.

Important: Return ONLY valid JSON, no markdown formatting or additional text.
Important: The content field should be ${chars} characters long.

The output should be valid JSON with two keys:
photo: a description of the photo that would accompany the post.
content: the Post text content. Important: the post content should be ${chars} characters in total, no more no less. 

Important notes:
- Avoid overfitting to hobbies. Interests are background context — they inform the user's world, but don’t constrain what they post about. 
- Not all posts should be positive, deep, or aesthetic. Real people post low-effort selfies, messy food pics, awkward group photos, screenshots, venting, or emotional outbursts.
- Use emojis, hashtags, or broken grammar *only when appropriate* for the user's tone and post context — don’t force them.
- Again: You don't ALWAYS have to include emojis or hashtags, use with moderation and depending on context.
- The tone and vibe should be consistent with how someone with this user's traits (age, gender, personality, interests, and background) would express themselves.
- The content must be exactly ${chars} characters long.

User profile:
${JSON.stringify(user, null, 2)}`,

    COMMENT: (user, post, chars) => `Generate a realistic, authentic Instagram comment from a user responding to their friend's post.

User characteristics:
Personality: ${user.personality}
Interests: ${user.interests.join(', ')}
Biography: ${user.biography}
Age: ${user.age}
Gender: ${user.gender}
Socioeconomic status: ${user.socioeconomicStatus}
Political orientation: ${user.politicalOrientation}

Friend's post content:
"${post.content}"

The comment should:
- Fully impersonate this user. Don't simulate a generic commenter. Instead, deeply internalize the user's personality, age, gender, political orientation, biography, and interests to decide *how they would naturally react* — whether with praise, humor, memes, questions, teasing, flirtation, criticism, or indifference.
- The comment can be any category: positive/praise, humor/memes/, question/curiosity, controversy/criticism, personal/teasing/in-group lingo. 
- Use at most 1–2 emojis *only if* they fit naturally with the user’s style and the post’s context, don´t overdo it.
- Feel authentic and realistic, as seen on real social media comments.
- The comment should be ${chars} characters long.

Generate only the comment text, no additional explanations.`,

    USER_PROFILE: (chars) => `Generate a possible human character by filling the following fields. 
    Generate a truly random personality. 
    All traits must be randomly and evenly distributed across possibilities (e.g., gender, political views, income level, education). Avoid idealizing or moral filtering.
    The personality can include both positive and negative traits, and should reflect realistic psychological diversity.
    
    Output should be JSON format with the respective keys:
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
Important: The total count of charachters in your answer should be ${chars} for the whole user profile.
Important: instagram_username must not include the hobbies of the person in the name.`
};

class AIPostGenerationService {
    constructor() {
        this.openaiClient = new OpenAIClient();
        this.stabilityClient = new StabilityAIClient();
        this.imageProvider = process.env.IMAGE_PROVIDER
    }

    // Helper function to get random number between min and max
    getRandomTokenCount(min, max) {
        const minTokens = parseInt(min) || 0;
        const maxTokens = parseInt(max) || minTokens;
        return Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;
    }

    getPostTokenLimits(distribution) {
        // Validate distribution array
        if (!Array.isArray(distribution) || distribution.length === 0) {
            throw new Error('Distribution must be a non-empty array of [percentage, tokenCount] pairs');
        }

        // Validate total percentage is 100%
        const totalPercentage = distribution.reduce((sum, [percentage]) => sum + percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            throw new Error('Distribution percentages must sum to 100%');
        }

        // Generate random number between 0 and 100
        const random = Math.random() * 100;
        
        // Find the bucket that contains our random number
        let cumulativePercentage = 0;
        for (let i = 0; i < distribution.length; i++) {
            const [percentage, tokenCount] = distribution[i];
            cumulativePercentage += percentage;
            
            if (random <= cumulativePercentage) {
                // Calculate min and max for this bucket
                const min = i === 0 ? 0 : distribution[i-1][1];
                const max = tokenCount;
                return { min, max };
            }
        }
        
        // Fallback to last bucket if something goes wrong
        const lastBucket = distribution[distribution.length - 1];
        return { min: 0, max: lastBucket[1] };
    }

    async generatePostForUser(user) {
        try {
            // Define the token distribution buckets <frequency, chars>
            const distribution = [
                [10, 10],   
                [20, 50],  
                [40, 100],  
                [15, 250],
                [10, 500], 
                [5, 800] 
            ];

            const { min, max } = this.getPostTokenLimits(distribution);
            const tokenCount = this.getRandomTokenCount(min, max);

            const prompt = PROMPTS.POST(user, tokenCount);

                          
            console.log('\n=== Post Generation Prompt ===');
            console.log(prompt);
            console.log('=======================================\n');
          
            // Generate both text content and photo description
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: tokenCount + 200,
                temperature: parseFloat(process.env.POST_GENERATION_TEMPERATURE) || 0.8
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
            
            let imageUrl;
            if (process.env.POST_PIC_GENERATION_ENABLED == 'true') {
            // Generate image based on the photo description
            const imagePrompt = `Generate a realistic photo of: ${parsedResponse.photo}, as it would be
            taken by someone with the following characteristics: ${JSON.stringify(user, null, 2)}`;
            imageUrl = await this.generateImage(imagePrompt);
            }else{
                console.log('Post picture generation is disabled. Skipping...');
            }

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
        try {
            const distribution = [
                [15,  10],   
                [20,  50],   
                [5,  70],
                [40, 100],   
                [10, 200],  
                [5,  400],  
                [5,  500]  
            ];

            const { min, max } = this.getPostTokenLimits(distribution);
            const tokenCount = this.getRandomTokenCount(min, max);

            const prompt = PROMPTS.COMMENT(user, post, tokenCount);
    
                  
            console.log('\n=== Comment Generation Prompt ===');
            console.log(prompt);
            console.log('=======================================\n');
            
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: tokenCount + 200,
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
            // Generate random token count between MIN and MAX
            const tokenCount = this.getRandomTokenCount(
                process.env.MIN_TOKENS_USER,
                process.env.MAX_TOKENS_USER
            );
            

            const prompt = PROMPTS.USER_PROFILE(tokenCount);
            
            console.log('\n=== User Profile Generation Prompt ===');
            console.log(prompt);
            console.log('=======================================\n');
            
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: tokenCount + 200,
                temperature: parseFloat(process.env.USER_PROFILE_TEMPERATURE) || 0.8
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