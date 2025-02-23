const BaseRepository = require('./BaseRepository');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

class DynamoPostRepository extends BaseRepository {
    constructor() {
        super();
    }

    async create(post) {
        const item = {
            PK: `USER#${post.userId}`,
            SK: `POST#${post.id}`,
            ...post.toJSON()
        };

        await this.put(item);
        return post;
    }

    async findById(id) {
        // Query all items related to this post (post details and comments)
        const params = {
            TableName: this.tableName,
            FilterExpression: 'contains(SK, :postId)',
            ExpressionAttributeValues: {
                ':postId': `POST#${id}`
            }
        };

        const result = await this.dynamoDB.scan(params).promise();
        if (!result.Items.length) return null;

        const postItem = result.Items.find(item => !item.SK.includes('COMMENT'));
        if (!postItem) return null;

        const post = new Post({
            ...postItem,
            id: id
        });

        // Add comments
        const comments = result.Items
            .filter(item => item.SK.includes('COMMENT'))
            .map(item => new Comment(item));
        
        post.comments = comments;
        return post;
    }

    async findAllOrderedByDate() {
        const params = {
            TableName: this.tableName,
            FilterExpression: 'begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':sk': 'POST#'
            }
        };

        const result = await this.dynamoDB.scan(params).promise();
        return result.Items
            .map(item => new Post(item))
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    async addComment(postId, comment) {
        const item = {
            PK: `POST#${postId}`,
            SK: `COMMENT#${comment.id}`,
            ...comment.toJSON()
        };

        await this.put(item);
        return comment;
    }

    async findByUserId(userId) {
        const results = await this.query(`USER#${userId}`, 'POST#');
        return results.map(item => new Post(item));
    }
}

module.exports = new DynamoPostRepository(); 