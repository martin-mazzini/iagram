console.log("Current directory:", process.cwd());
const path = require('path');
const result = require('dotenv').config();
console.log("Dotenv result:", result);
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);


const app = require('./src/app');
const BackgroundJobService = require('./src/services/jobs/BackgroundJobService');
const AIPostGenerationJob = require('./src/services/jobs/AIPostGenerationJob');
const MockDataService = require('./src/services/data/MockDataService');
const { createTable } = require('./src/config/dynamodb');


const PORT = process.env.PORT || 5000;

// Initialize background jobs
function initializeBackgroundJobs() {
    // Schedule AI post generation job to run every 30 minutes
    // You can adjust the schedule as needed
    BackgroundJobService.scheduleJob(
        'aiPostGeneration',
        '*/5 * * * * *',  // Cron expression: Every 30 minutes
        AIPostGenerationJob.execute
    );
}

// Initialize DynamoDB table and other services
async function initializeServices() {
    try {
        // Create DynamoDB table
        await createTable();
        
        // Initialize background jobs
        initializeBackgroundJobs();
        
        // Initialize mock data
        const mockUsers = await MockDataService.initializeMockData();
        console.log(`Initialized application with ${mockUsers.length} mock users`);
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
