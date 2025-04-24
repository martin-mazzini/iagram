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

    static async generateCommentForRandomPost() {
        // Get the latest 5 posts
        const { posts } = await DynamoPostRepository.findAllOrderedByDate(5);
        
        if (!posts || posts.length === 0) {
            console.log('No posts found. Skipping comment generation.');
            return null;
        }

        // Filter posts with less than 4 comments
        const eligiblePosts = posts.filter(post => !post.comments || post.comments.length < 4);
        
        if (eligiblePosts.length === 0) {
            console.log('No eligible posts found (all have 4 or more comments). Skipping comment generation.');
            return null;
        }

        // Pick a random post from eligible ones
        const randomPost = eligiblePosts[Math.floor(Math.random() * eligiblePosts.length)];

        // Get a random friend of the post's author
        const potentialFriends = await DynamoUserRepository.getRandomPotentialFriendIds(randomPost.userId);
        
        if (!potentialFriends || potentialFriends.length === 0) {
            console.log(`No potential friends found for post author ${randomPost.userId}. Skipping comment generation.`);
            return null;
        }

        // Pick a random friend
        const randomFriendId = potentialFriends[Math.floor(Math.random() * potentialFriends.length)];
        
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