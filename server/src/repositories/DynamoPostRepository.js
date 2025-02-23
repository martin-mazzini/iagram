const BaseRepository = require('./BaseRepository');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

class DynamoPostRepository extends BaseRepository {
    constructor() {
        super();
    }

    async create(post) {
        // Store the post with PK = POST#{id}
        const postItem = {
            PK: `POST#${post.id}`,
            SK: 'DETAILS',
            ...post.toJSON()
        };

        // Also create a reference in the user's posts
        const userPostRef = {
            PK: `USER#${post.userId}`,
            SK: `POST#${post.id}`,
            postId: post.id,
            createdAt: post.createdAt
        };

        await Promise.all([
            this.put(postItem),
            this.put(userPostRef)
        ]);

        return post;
    }

    //finds a post by id including comments
    //couldn't comments just be a json field in the post?
    async findById(id) {
        const postData = await this.get(`POST#${id}`, 'DETAILS');
        if (!postData) return null;

        const post = new Post({
            ...postData,
            id: id
        });

        // Get associated comments
        const comments = await this.query(`POST#${id}`, 'COMMENT#');
        post.comments = comments.map(item => new Comment(item));

        return post;
    }

    async findByUserId(userId) {
        // Get all post references for this user
        const postRefs = await this.query(`USER#${userId}`, 'POST#');
        
        // Get the full post details for each reference
        const posts = await Promise.all(
            postRefs.map(ref => this.findById(ref.postId))
        );

        return posts.sort((a, b) => b.createdAt - a.createdAt);
    }

    //this needs to be optimzied
    async findAllOrderedByDate() {
        const params = {
            TableName: this.tableName,
            FilterExpression: 'SK = :sk',
            ExpressionAttributeValues: {
                ':sk': 'DETAILS'
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
}

module.exports = new DynamoPostRepository(); 