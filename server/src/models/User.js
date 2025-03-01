const { v4: uuidv4 } = require('uuid');

class User {
    constructor({
        id,
        username,
        age,
        gender,
        personality,
        biography,
        nationality,
        socioeconomicStatus,
        politicalOrientation,
        interests,
        friends = []
    }) {
        this.id = id;
        this.username = username || `user_${id.slice(0, 8)}`;
        this.age = age;
        this.gender = gender;
        this.personality = personality;
        this.biography = biography;
        this.nationality = nationality;
        this.socioeconomicStatus = socioeconomicStatus;
        this.politicalOrientation = politicalOrientation;
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
            username: this.username,
            age: this.age,
            gender: this.gender,
            personality: this.personality,
            biography: this.biography,
            nationality: this.nationality,
            socioeconomicStatus: this.socioeconomicStatus,
            politicalOrientation: this.politicalOrientation,
            interests: this.interests,
            friends: this.friends,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User; 