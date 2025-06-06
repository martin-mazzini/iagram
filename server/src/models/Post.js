const { v4: uuidv4 } = require('uuid');


class Post {
    constructor({
        id,
        photo,
        content,
        imageUrl,
        userId,
        username,
        likes,
        commentLimit,
        commentedBy,
        comments,
        createdAt,
        updatedAt
    }) {
        this.id = id || uuidv4();
        this.photo = photo;
        this.content = content;
        this.imageUrl = imageUrl;
        this.userId = userId;
        this.username = username;
        this.likes = likes || 0;
        this.commentLimit = commentLimit || 0;
        this.commentedBy = commentedBy || [];
        this.comments = comments || [];
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    }

    addComment(comment) {
        this.comments.push(comment);
        if (!this.commentedBy.includes(comment.userId)) {
            this.commentedBy.push(comment.userId);
        }
        this.updatedAt = new Date();
    }

    removeComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            this.comments = this.comments.filter(c => c.id !== commentId);
            this.commentedBy = this.commentedBy.filter(id => id !== comment.userId);
            this.updatedAt = new Date();
        }
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
        const safeToISOString = (date) => {
            if (!date) return null;
            const d = (date instanceof Date) ? date : new Date(date);
            return isNaN(d.getTime()) ? null : d.toISOString();
        };

        return {
            id: this.id,
            photo: this.photo,
            content: this.content,
            imageUrl: this.imageUrl,
            userId: this.userId,
            username: this.username,
            likes: this.likes,
            commentLimit: this.commentLimit,
            commentedBy: this.commentedBy,
            comments: this.comments.map(comment => comment.toJSON()),
            createdAt: safeToISOString(this.createdAt),
            updatedAt: safeToISOString(this.updatedAt)
        };
    }
}

module.exports = Post; 