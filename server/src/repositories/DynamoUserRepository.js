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
}

module.exports = new DynamoUserRepository(); 