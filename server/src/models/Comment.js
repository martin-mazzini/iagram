const { v4: uuidv4 } = require('uuid');

class Comment {
    constructor({
        text,
        userId,
        postId
    }) {
        this.id = uuidv4();
        this.text = text;
        this.userId = userId;
        this.postId = postId;
        this.createdAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            text: this.text,
            userId: this.userId,
            postId: this.postId,
            createdAt: this.createdAt
        };
    }
}

module.exports = Comment; 