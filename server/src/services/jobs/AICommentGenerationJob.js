const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const CommentGenerationService = require('../ai/CommentGenerationService');

class AICommentGenerationJob {
    static async execute() {
        try {
            console.log('\n=== Executing AI Comment Generation Job ===');
            console.log(`Time: ${new Date().toISOString()}`);
            
            // Get a random user
            const user = await DynamoUserRepository.findAll();
            if (!user || user.length === 0) {
                console.log('No users found. Skipping job.');
                return;
            }
            const randomIndex = Math.floor(Math.random() * user.length);
            const selectedUser = user[randomIndex];
            
            console.log(`Selected random user: ${selectedUser.username} (${selectedUser.id})`);
            
            // Get a random friend
            const friends = selectedUser.friends || [];
            if (friends.length === 0) {
                console.log('No friends found for user. Skipping job.');
                return;
            }
            const randomFriendIndex = Math.floor(Math.random() * friends.length);
            const selectedFriendId = friends[randomFriendIndex];
            
            console.log(`Selected random friend: ${selectedFriendId}`);
            
            // Generate and post a comment
            const comment = await CommentGenerationService.generateCommentForFriend(selectedUser.id, selectedFriendId);
            
            // Check if comment generation was successful
            if (!comment) {
                console.log(`Skipping comment creation as no valid posts were found.`);
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