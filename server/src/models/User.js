const { v4: uuidv4 } = require('uuid');

class User {
    constructor({
        id,
        personality,
        biography,
        interests,
        friends = []
    }) {
        this.id = id;
        this.personality = personality;
        this.biography = biography;
        this.interests = interests;
        this.friends = friends; // Array of user IDs (UUIDs)
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    addFriend(friendId) {
        if (!this.friends.includes(friendId)) {
            this.friends.push(friendId);
            this.updatedAt = new Date();
        }
    }

    removeFriend(friendId) {
        this.friends = this.friends.filter(id => id !== friendId);
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            personality: this.personality,
            biography: this.biography,
            interests: this.interests,
            friends: this.friends,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User; 