const OpenAIClient = require('./OpenAIClient');
const StabilityAIClient = require('./StabilityAIClient');
const Post = require('../../models/Post');
const User = require('../../models/User');
const { v4: uuidv4 } = require('uuid');
const DynamoPostRepository = require('../../repositories/DynamoPostRepository');
const PROMPTS = require('./prompts');

class AIPostGenerationService {
    constructor() {
        this.openaiClient = new OpenAIClient();
        this.stabilityClient = new StabilityAIClient();
        this.imageProvider = process.env.IMAGE_PROVIDER
    }


    async generatePostForUser(user) {
        try {
            // Define the token distribution buckets <frequency, chars>
            const distribution = [
                [10, 10],   
                [20, 50],  
                [38, 100],  
                [13, 250],
                [10, 500], 
                [9, 600] 
            ];

            const { min, max } = this.getPostTokenLimits(distribution);
            const tokenCount = this.getRandomTokenCount(min, max);

            let prompt = PROMPTS.POST(user, tokenCount);

            let customPrompt = this.customizePrompt([
                {
                    name: "postType",
                    exclusive: true,
                    options: [
                        //[0.5, "Extremely Important: This specific post should be hobby related"],
                        [0.4, "Extremely Important: This specific post should be a personal life update post (can vary between minor to important milestones or life events)"],
                        //[0.3, "Extremely Important: This specific post should be a selfie"],
                        //[0.3, "Extremely Important: This specific post should be somehow related to current world events"],
                        //[0.4, "Extremely Important: This specific post should be a relational/romantic post, with a partner, family, a friend or group of friends."]
                    ]
                },
                {
                    name: "postCharachteristics",
                    exclusive: false,
                    options: [
                        [0.25, "Extremely Important: This specific post should have no people in the image."],
                        [0.3, "Extremely Important: This specific post should be a low effort post (poorly cropped/bad lightning/blurred image)"],
                        [0.7, "Extremely Important: This specific post should have no hashtags"],
                        [0.7, "Extremely Important: This specific post should have no emojis in its text"],
                    ]
                }
            ]);
            prompt = prompt + '\n' + customPrompt;

                          
            console.log('\n=== Post Generation Prompt ===');
            console.log(prompt);
            console.log('=======================================\n');
          
            // Generate both text content and photo description
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: 400,
                temperature: parseFloat(process.env.POST_GENERATION_TEMPERATURE) || 0.8
            });

            console.log('Raw AI Response:', response.content);
            
            // Parse the JSON response
            let parsedResponse;
            try {
                const possibleJson = response.content.replace(/```json\n?|\n?```/g, '').trim();
                parsedResponse = JSON.parse(possibleJson);
                console.log('User is:', user.biography);
                console.log('Post content is:', parsedResponse.content);
                console.log('Post image prompt is:', parsedResponse.photo);
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
                photo: parsedResponse.photo,
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

            let prompt = PROMPTS.COMMENT(user, post, tokenCount);
    
            let customPrompt = this.customizePrompt([
                {
                    name: "commentType",
                    exclusive: false,
                    options: [
                        [0.7, "Extremely Important: This specific comment should not have any emojis"],
                        [0.2, "Extremely Important: This specific comment should have (light) bad/broken grammar or punctuation"],
                    ]
                },
                {
                    name: "commentType",
                    exclusive: true,
                    options: [
                        [0.15, "Extremely Important: This specific comment should be indifferent / critique / disagreement (mild or strong) depending on context (user personality and post content)"],
                        [0.2, "Extremely Important: This specific comment should be just a chill praise / positive comment"],
                        [0.2, "Extremely Important: This specific comment should be flirty if it makes sense given the whole context of both users characteristics/status and the post content. If it doesn't make sense, then ignore this instruction."],
                    ]
                }
            ]);

            prompt = prompt + '\n' + customPrompt;
                  
            console.log('\n=== Comment Generation Prompt ===');
            console.log(prompt);
            console.log('=======================================\n');
            
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: 300,
                temperature: 0.8
            });

            console.log('\n=== Generated Comment ===');
            console.log(response.content);
            console.log('=======================================\n');
            

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
            

            let prompt = PROMPTS.USER_PROFILE(tokenCount);

            let customPrompt = this.customizePrompt([
                {
                    name: "familyStatus",
                    exclusive: false,
                    options: [
                        [0.6, "Extremely Important: This specific user shouldn't have any pets"],
                        [0.4, "Extremely Important: This specific user should have a family (husband/wife/children)"]
                    ]
                },
                {
                    name: "politicalViews",
                    exclusive: true,
                    options: [
                        [0.3, "Extremely Important: This specific user should be right wing or conservative leaning"]
                    ]
                },
                {
                    name: "personalityTraits",
                    exclusive: false,
                    options: [
                        [0.3, "Extremely Important: This specific user should have clear negative traits, like narcissism, arrogance, impulsivity, anxiety, etc."]
                    ]
                }
            ]);
            prompt = prompt + '\n' + customPrompt;

            
            console.log('\n=== User Profile Generation Prompt ===');
            console.log(prompt);
            console.log('=======================================\n');
            
            const response = await this.openaiClient.generateResponse(prompt, {
                max_tokens: 500,
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

            const requiredFields = ['age', 'gender', 'personality', 'biography', 'nationality', 'interests', 'instagram_username', 'name'];
            const missingFields = requiredFields.filter(field => !userData[field]);
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const userModelData = {
                id: require('uuid').v4(),
                name: userData.name,
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

            console.log('User model data is:', JSON.stringify(userModelData, null, 2));
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


 /**
     * Takes an array of category objects and returns a string with selected items based on their probabilities.
     * Each selected string will be on a new line.
     * @param {Array<{name: string, exclusive: boolean, options: Array<[number, string]>}>} categories - Array of category objects
     * @returns {string} - Selected strings joined by newlines
     */
 customizePrompt(categories) {
    if (!Array.isArray(categories)) {
        throw new Error('Input must be an array of category objects');
    }

    const selectedStrings = [];

    // Process each category
    categories.forEach(category => {
        if (!category.options || !Array.isArray(category.options)) {
            throw new Error(`Category ${category.name} must have an array of options`);
        }

        // Filter valid options based on probability
        const validOptions = category.options.filter(([probability, _]) => {
            if (typeof probability !== 'number' || probability < 0 || probability > 1) {
                throw new Error('Probability must be a number between 0 and 1');
            }
            return Math.random() < probability;
        });

        if (validOptions.length > 0) {
            if (category.exclusive) {
                // For exclusive categories, randomly select one option
                const randomIndex = Math.floor(Math.random() * validOptions.length);
                selectedStrings.push(validOptions[randomIndex][1]);
            } else {
                // For non-exclusive categories, add all valid options
                validOptions.forEach(([_, string]) => selectedStrings.push(string));
            }
        }
    });

    return selectedStrings.join('\n');
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






}

module.exports = new AIPostGenerationService();