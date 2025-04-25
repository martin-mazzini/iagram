console.log("Current directory:", process.cwd());
const path = require('path');

// Check if --local flag is present
const isLocal = process.argv.includes('--local');
if (isLocal) {
    const result = require('dotenv').config();
    console.log("Dotenv result:", result);
}
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

// Add logging of OpenAI configuration
console.log("\n=== OpenAI Configuration ===");
console.log("Model:", process.env.OPENAI_MODEL);
console.log("Min Tokens (Post):", process.env.MIN_TOKENS_POST);
console.log("Min Tokens (Comment):", process.env.MIN_TOKENS_COMMENT);
console.log("Min Tokens (User):", process.env.MIN_TOKENS_USER);
console.log("Max Tokens (Post):", process.env.MAX_TOKENS_POST);
console.log("Max Tokens (Comment):", process.env.MAX_TOKENS_COMMENT);
console.log("Max Tokens (User):", process.env.MAX_TOKENS_USER);
console.log("Min Post Charactersss:", process.env.MIN_POST_CHARS);
console.log("Min Comment Characters:", process.env.MIN_COMMENT_CHARS);
console.log("Min User Bio/Personality Chars:", process.env.MIN_USER_CHARS);
console.log("Post Generation Temperature:", process.env.POST_GENERATION_TEMPERATURE);
console.log("User Profile Temperature:", process.env.USER_PROFILE_TEMPERATURE);
console.log("Profile Pic Generation Enabled:", process.env.PROFILE_PIC_GENERATION_ENABLED);
console.log("Post Pic Generation Enabled:", process.env.POST_PIC_GENERATION_ENABLED);
console.log("===========================\n");

const app = require('./src/app');
const BackgroundJobService = require('./src/services/jobs/BackgroundJobService');
const MockDataService = require('./src/services/data/MockDataService');
const { createTable } = require('./src/config/dynamodb');

const PORT = process.env.PORT || 5000;

// Initialize DynamoDB table and other services
async function initializeServices() {
    try {
        // Create DynamoDB table
        await createTable();
        
        // Initialize background jobs
        BackgroundJobService.initialize();
        
        // Initialize mock data
        // Temporarily disabled mock user generation
        // const mockUsers = await MockDataService.initializeMockData();
        // console.log(`Initialized application with ${mockUsers.length} mock users`);
    } catch (error) {
        console.error('Error initializing services:', error);
        throw error;
    }
}

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await initializeServices();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Cleaning up...');
    BackgroundJobService.cancelAllJobs();
    // Add any other cleanup logic here
    process.exit(0);
});
