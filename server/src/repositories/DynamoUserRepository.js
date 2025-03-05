const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class DynamoUserRepository extends BaseRepository {
    constructor() {
        super();
        
    }
    
    async create(user) {
        const item = {
            PK: `USER#${user.id}`,
            SK: 'PROFILE',
            ...user.toJSON()
        };

        await this.put(item);
        return user;
    }

    async findById(id) {
        const result = await this.get(`USER#${id}`, 'PROFILE');
        if (!result) return null;

        return new User(result);
    }

    //this needs to be optimized
    async findAll() {
        // Note: In production, you might want to use a GSI for this
        const params = {
            TableName: this.tableName,
            FilterExpression: 'SK = :sk',
            ExpressionAttributeValues: {
                ':sk': 'PROFILE'
            }
        };

        const result = await this.dynamoDB.scan(params).promise();
        return result.Items.map(item => new User(item));
    }

    async update(user) {
        return this.create(user); // Put operation will overwrite existing item
    }

    async delete(id) {
        await this.delete(`USER#${id}`, 'PROFILE');
    }

    async findByInterest(interest) {
        const allUsers = await this.findAll();
        return allUsers.filter(user => user.interests.includes(interest));
    }
    

    // Get 5 random user IDs that could be friends (excluding the specified user)
    async getRandomPotentialFriendIds(userId) {
        // Get all users
        const allUsers = await this.findAll();
        
        // Filter out the current user
        const potentialFriends = allUsers.filter(potentialFriend => 
            potentialFriend.id !== userId
        );
        
        if (potentialFriends.length === 0) {
            console.log(`No potential friends found for user ${userId}`);
            return [];
        }
        
        // Shuffle the potential friends array
        const shuffled = [...potentialFriends].sort(() => 0.5 - Math.random());
        
        // Take up to 5 random users
        const numToAdd = Math.min(5, shuffled.length);
        const newFriends = shuffled.slice(0, numToAdd);
        
        // Return just the IDs
        return newFriends.map(friend => friend.id);
    }
}

module.exports = new DynamoUserRepository(); 