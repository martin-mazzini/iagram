console.log("Current directory:", process.cwd());
const path = require('path');
const result = require('dotenv').config();
console.log("Dotenv result:", result);
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

// Add logging of OpenAI configuration
console.log("\n=== OpenAI Configuration ===");
console.log("Model:", process.env.OPENAI_MODEL);
console.log("Max Tokens (Post):", process.env.MAX_TOKENS_POST);
console.log("Max Tokens (Comment):", process.env.MAX_TOKENS_COMMENT);
console.log("Max Tokens (Profile):", process.env.MAX_TOKENS_PROFILE);
console.log("Min Post Charactersss:", process.env.MIN_POST_CHARS);
console.log("Min User Bio/Personality Chars:", process.env.MIN_USER_CHARS);
console.log("===========================\n");

const app = require('./src/app');
const BackgroundJobService = require('./src/services/jobs/BackgroundJobService');
const AIPostGenerationJob = require('./src/services/jobs/AIPostGenerationJob');
const MockDataService = require('./src/services/data/MockDataService');
const { createTable } = require('./src/config/dynamodb');


const PORT = process.env.PORT || 5000;

// Initialize background jobs
function initializeBackgroundJobs() {
    // Log job configuration
    console.log("\n=== AI Post Generation Job Configuration ===");
    console.log("POST_JOB_ENABLED:", process.env.POST_JOB_ENABLED);
    console.log("POST_JOB_CRON:", process.env.POST_JOB_CRON);
    console.log("Job will run:", process.env.POST_JOB_ENABLED === 'true' ? 'YES' : 'NO');
    console.log("==========================================\n");
    
    // Check if job is enabled via environment variable
    const isJobEnabled = process.env.POST_JOB_ENABLED === 'true';
    
    if (!isJobEnabled) {
        console.log('AI Post Generation Job is disabled via POST_JOB_ENABLED environment variable');
        return;
    }
    
    // Get CRON schedule from environment variable or use default
    const cronSchedule = process.env.POST_JOB_CRON || '0 */2 * * *';
    console.log(`Scheduling AI Post Generation Job with cron: ${cronSchedule}`);
    
    // Schedule AI post generation job
    BackgroundJobService.scheduleJob(
        'aiPostGeneration',
        cronSchedule,
        AIPostGenerationJob.execute
    );
    
    console.log('Background jobs initialized');
}

// Initialize DynamoDB table and other services
async function initializeServices() {
    try {
        // Create DynamoDB table
        await createTable();
        
        // Initialize background jobs
        initializeBackgroundJobs();
        
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
