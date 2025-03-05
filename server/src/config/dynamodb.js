const AWS = require('aws-sdk');

// Configure AWS to use local DynamoDB
const config = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
    // Add this to ensure proper local DynamoDB connection
    sslEnabled: false,
    // Remove the logger to prevent excessive table logging
    // logger: console
};

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