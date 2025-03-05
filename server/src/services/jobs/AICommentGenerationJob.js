const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const CommentGenerationService = require('../ai/CommentGenerationService');

class AICommentGenerationJob {
    static async execute() {
        try {
            console.log('\n=== Executing AI Comment Generation Job ===');
            console.log('Time:', new Date().toISOString());
            
            // Get all users
            const users = await DynamoUserRepository.findAll();
            
            if (!users || users.length === 0) {
                console.log('No users found. Skipping comment generation.');
                return;
            }
            
            // Select a random user
            const randomIndex = Math.floor(Math.random() * users.length);
            const selectedUser = users[randomIndex];
            
            console.log(`Selected random user: ${selectedUser.username} (${selectedUser.id})`);
            
            // Get user's friends
            const friends = selectedUser.friends || [];
            
            if (friends.length === 0) {
                console.log(`User ${selectedUser.username} has no friends. Skipping comment generation.`);
                return;
            }
            
            // Select a random friend
            const randomFriendIndex = Math.floor(Math.random() * friends.length);
            const selectedFriendId = friends[randomFriendIndex];
            
            console.log(`Selected random friend: ${selectedFriendId}`);
            
            // Generate a comment on the friend's post
            const result = await CommentGenerationService.generateCommentForFriend(
                selectedUser.id,
                selectedFriendId
            );
            
            console.log(`Successfully generated comment on post: ${result.postId}`);
            console.log('Comment content:', result.comment.text);
            console.log('=== AI Comment Generation Job Completed ===\n');
            
            return result;
        } catch (error) {
            console.error('Error in AI Comment Generation Job:', error);
        }
    }
}

module.exports = AICommentGenerationJob; 