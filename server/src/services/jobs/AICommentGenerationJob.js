const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const CommentGenerationService = require('../ai/CommentGenerationService');

class AICommentGenerationJob {
    static async execute() {
        try {
            console.log('\n=== Executing AI Comment Generation Job ===');
            console.log(`Time: ${new Date().toISOString()}`);
        
            // Generate and post a comment
            const comment = await CommentGenerationService.generateCommentForRandomPost();
            
            // Check if comment generation was successful
            if (!comment) {
                console.log(`comment creation was skippedd.`);
                return;
            }
            
            console.log(`Successfully generated comment on post: ${comment.postId}`);
            console.log('Comment content:', comment.comment.text);
            console.log('=== AI Comment Generation Job Completed ===\n');
            
            return comment;
        } catch (error) {
            console.error('Error in AI Comment Generation Job:', error);
        }
    }
}

module.exports = AICommentGenerationJob; 