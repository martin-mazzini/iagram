const DynamoUserRepository = require('../../repositories/DynamoUserRepository');
const DynamoPostRepository = require('../../repositories/DynamoPostRepository');
const AIPostGenerationService = require('./AIGenService');
const Comment = require('../../models/Comment');

class CommentGenerationService {


    static async generateCommentForRecentPosts() {
        // Get the latest 5 posts
        const { posts } = await DynamoPostRepository.findAllOrderedByDate(5);
        
        if (!posts || posts.length === 0) {
            console.log('No posts found. Skipping comment generation.');
            return null;
        }

        // Filter posts that haven't reached their comment limit
        const eligiblePosts = posts.filter(post => 
            !post.comments || post.comments.length < post.commentLimit
        );
        
        if (eligiblePosts.length === 0) {
            console.log('No eligible posts found (all have reached their comment limit). Skipping comment generation.');
            return null;
        }

        // Pick a random post from eligible ones
        const randomPost = eligiblePosts[Math.floor(Math.random() * eligiblePosts.length)];

        // Get potential friends of the post's author
        const potentialFriends = await DynamoUserRepository.getRandomPotentialFriendIds(randomPost.userId);
        
        if (!potentialFriends || potentialFriends.length === 0) {
            console.log(`No potential friends found for post author ${randomPost.userId}. Skipping comment generation.`);
            return null;
        }

        // Filter out friends who have already commented on this post
        const eligibleFriends = potentialFriends.filter(friendId => 
            !randomPost.commentedBy || !randomPost.commentedBy.includes(friendId)
        );

        if (eligibleFriends.length === 0) {
            console.log(`No eligible friends found (all have already commented on post ${randomPost.id}). Skipping comment generation.`);
            return null;
        }

        // Pick a random friend from eligible ones
        const randomFriendId = eligibleFriends[Math.floor(Math.random() * eligibleFriends.length)];
        
        // Get the friend's user data
        const friend = await DynamoUserRepository.findById(randomFriendId);
        if (!friend) {
            console.log(`Friend ${randomFriendId} not found. Skipping comment generation.`);
            return null;
        }

        // Generate comment using AI
        const commentText = await AIPostGenerationService.generateCommentForPost(friend, randomPost);

        // Create and save the comment
        const comment = new Comment({
            text: commentText,
            userId: friend.id,
            username: friend.username,
            postId: randomPost.id
        });

        await DynamoPostRepository.addComment(randomPost.id, comment);
        
        return {
            comment,
            postId: randomPost.id,
            friendId: friend.id
        };
    }
}

module.exports = CommentGenerationService; 