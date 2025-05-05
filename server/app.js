console.log("Current directory:", process.cwd());
const path = require('path');

const isLocal = process.argv.includes('--local');
if (isLocal) {
    const result = require('dotenv').config();
    console.log("Dotenv result:", result);
} 

console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("\n===Configuration ===");
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
const { createTable } = require('./src/config/dynamodb');

const PORT = process.env.PORT || 5000;

async function initializeServices() {
    try {
        await createTable();
        BackgroundJobService.initialize();
    
    } catch (error) {
        console.error('Error initializing services:', error);
        throw error;
    }
}

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await initializeServices();
});


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Cleaning up...');
    BackgroundJobService.cancelAllJobs();
    process.exit(0);
});
