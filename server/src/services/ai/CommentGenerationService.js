const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const DynamoPostRepository = require('../../repositories/DynamoPostRepository');
const AIPostGenerationService = require('./AIPostGenerationService');
const Comment = require('../../models/Comment');

class CommentGenerationService {
    static async generateCommentForFriend(userId, friendId) {
        // Get the user
        const user = await DynamoUserRepository.findById(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // Get friend's posts
        const friendPosts = await DynamoPostRepository.findByUserId(friendId);
        if (!friendPosts || !friendPosts.length) {
            throw new Error(`No posts found from friend: ${friendId}`);
        }

        // Select the most recent post
        const targetPost = friendPosts[0];

        // Generate comment using AI
        const commentText = await AIPostGenerationService.generateCommentForPost(user, targetPost);

        // Create and save the comment
        const comment = new Comment({
            text: commentText,
            userId: user.id,
            username: user.username,
            postId: targetPost.id
        });

        await DynamoPostRepository.addComment(targetPost.id, comment);
        
        return {
            comment,
            postId: targetPost.id,
            friendId
        };
    }
}

module.exports = CommentGenerationService; 