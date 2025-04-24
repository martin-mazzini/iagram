const AWS = require('aws-sdk');

// Configure AWS to use local DynamoDB
let config = {
    region: process.env.AWS_REGION || 'local',
};

if (process.env.ENVIRONMENT !== 'PRODUCTION') {
    config = {
        ...config,
        endpoint: process.env.DYNAMO_ENDPOINT || 'http://dynamodb-local:8000',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
        sslEnabled: false,
    };
}

const dynamoDB = new AWS.DynamoDB.DocumentClient(config);
const dynamoDb = new AWS.DynamoDB(config);

const TableName = 'SocialMediaTable';

// Initialize table
const createTable = async () => {
    const params = {
        TableName,
        KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        await dynamoDb.createTable(params).promise();
        console.log('Table created successfully');
    } catch (error) {
        if (error.code === 'ResourceInUseException') {
            console.log('Table already exists');
        } else {
            console.error('Error creating table:', error);
            throw error;
        }
    }
};

module.exports = {
    dynamoDB,
    TableName,
    createTable
}; 