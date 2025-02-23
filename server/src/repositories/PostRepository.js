const Comment = require('../models/Comment');

class PostRepository {
    constructor() {
        this.posts = new Map();
    }

    create(post) {
        this.posts.set(post.id, post);
        return post;
    }

    findById(id) {
        return this.posts.get(id) || null;
    }

    findAll() {
        return Array.from(this.posts.values());
    }

    update(post) {
        if (!this.posts.has(post.id)) {
            throw new Error('Post not found');
        }
        this.posts.set(post.id, post);
        return post;
    }

    delete(id) {
        return this.posts.delete(id);
    }

    // Find posts by user ID
    findByUserId(userId) {
        return Array.from(this.posts.values())
            .filter(post => post.userId === userId);
    }

    // Add a comment to a post
    addComment(postId, comment) {
        const post = this.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        post.addComment(comment);
        return this.update(post);
    }

    // Get posts from friends of a user
    getFriendsPosts(userId, userRepository) {
        const user = userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return Array.from(this.posts.values())
            .filter(post => user.friends.includes(post.userId))
            .sort((a, b) => b.createdAt - a.createdAt);
    }
}

module.exports = new PostRepository(); // Export singleton instance 