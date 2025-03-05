const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const DynamoPostRepository = require('../../repositories/DynamoPostRepository');
const AIPostGenerationService = require('./AIPostGenerationService');
const Comment = require('../../models/Comment');

class CommentGenerationService {
    static async generateCommentForFriend(userId, friendId) {
        // Get posts from the friend
        const posts = await DynamoPostRepository.findByUserId(friendId);
        
        // Check if friend has any posts
        if (!posts || posts.length === 0) {
            console.log(`No posts found for friend ${friendId}. Skipping comment generation.`);
            return null; // Return null instead of throwing an error
        }

        // Get the user
        const user = await DynamoUserRepository.findById(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // Select the most recent post
        const targetPost = posts[0];

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