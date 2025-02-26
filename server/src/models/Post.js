const { v4: uuidv4 } = require('uuid');

class Post {
    constructor({
        id,
        content,
        imageUrl,
        userId
    }) {
        this.id = id || uuidv4();
        this.content = content;
        this.imageUrl = imageUrl;
        this.userId = userId;
        this.likes = 0;
        this.comments = []; // Array of Comment objects
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    addComment(comment) {
        this.comments.push(comment);
        this.updatedAt = new Date();
    }

    removeComment(commentId) {
        this.comments = this.comments.filter(comment => comment.id !== commentId);
        this.updatedAt = new Date();
    }

    addLike() {
        this.likes += 1;
        this.updatedAt = new Date();
    }

    removeLike() {
        if (this.likes > 0) {
            this.likes -= 1;
            this.updatedAt = new Date();
        }
    }

    toJSON() {
        return {
            id: this.id,
            content: this.content,
            imageUrl: this.imageUrl,
            userId: this.userId,
            username: this.username,
            likes: this.likes,
            comments: this.comments.map(comment => comment.toJSON()),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Post; 