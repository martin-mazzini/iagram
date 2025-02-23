const { dynamoDB, TableName } = require('../config/dynamodb');

class BaseRepository {
    constructor() {
        this.dynamoDB = dynamoDB;
        this.tableName = TableName;
    }

    async get(pk, sk) {
        const params = {
            TableName: this.tableName,
            Key: {
                PK: pk,
                SK: sk
            }
        };

        const result = await this.dynamoDB.get(params).promise();
        return result.Item;
    }

    async put(item) {
        const params = {
            TableName: this.tableName,
            Item: item
        };

        await this.dynamoDB.put(params).promise();
        return item;
    }

    async query(pk, skPrefix = null) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: skPrefix 
                ? 'PK = :pk AND begins_with(SK, :sk)'
                : 'PK = :pk',
            ExpressionAttributeValues: skPrefix
                ? { ':pk': pk, ':sk': skPrefix }
                : { ':pk': pk }
        };

        const result = await this.dynamoDB.query(params).promise();
        return result.Items;
    }

    async delete(pk, sk) {
        const params = {
            TableName: this.tableName,
            Key: {
                PK: pk,
                SK: sk
            }
        };

        await this.dynamoDB.delete(params).promise();
    }
}

module.exports = BaseRepository; 