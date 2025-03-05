const UserGenerationService = require('../ai/UserGenerationService');

class AIUserGenerationJob {
    static async execute() {
        try {
            console.log('\n=== Executing AI User Generation Job ===');
            console.log(`Time: ${new Date().toISOString()}`);
            
            const user = await UserGenerationService.generateUser();
            
            console.log(`Successfully generated user: ${user.username} (${user.id})`);
            console.log('=== AI User Generation Job Completed ===\n');
            
            return user;
        } catch (error) {
            console.error('Error in AI User Generation Job:', error);
        }
    }
}

module.exports = AIUserGenerationJob; 