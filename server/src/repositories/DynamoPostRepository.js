const BaseRepository = require('./BaseRepository');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

class DynamoPostRepository extends BaseRepository {
    constructor() {
        super();
    }

    async create(post) {
        // Format the createdAt date for sorting
        const createdAtISO = post.createdAt.toISOString();

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

        // Create a feed entry with date-based sorting
        const feedEntry = {
            PK: 'FEED',
            SK: `${createdAtISO}#${post.id}`,
            postId: post.id
        };

        await Promise.all([
            this.put(postItem),
            this.put(userPostRef),
            this.put(feedEntry)
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

    /**
     * Get posts ordered by date with date-based pagination
     * @param {number} pageSize - Number of posts to return
     * @param {string} startDate - ISO date string to start from (exclusive)
     * @param {string} startId - Post ID to start from (when multiple posts have same timestamp)
     * @returns {Object} - Posts and pagination info
     */
    async findAllOrderedByDate(pageSize = 20, startDate = null, startId = null) {
        // Query the feed entries ordered by date (using SK)
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :feedType',
            ExpressionAttributeValues: {
                ':feedType': 'FEED'
            },
            ScanIndexForward: false, // false for descending order (newest first)
            Limit: pageSize
        };

        // If we have a starting point, add it to the query
        if (startDate && startId) {
            params.KeyConditionExpression += ' AND SK < :startKey';
            params.ExpressionAttributeValues[':startKey'] = `${startDate}#${startId}`;
        }

        const result = await this.dynamoDB.query(params).promise();
        
        // Get the full post details for each feed entry
        const posts = await Promise.all(
            result.Items.map(item => {
                const postId = item.SK.split('#')[1]; // Extract post ID from SK
                return this.findById(postId);
            })
        );

        // Get pagination info from the last item
        let nextStartDate = null;
        let nextStartId = null;
        
        if (result.Items.length > 0 && result.Items.length === pageSize) {
            const lastItem = result.Items[result.Items.length - 1];
            const [date, id] = lastItem.SK.split('#');
            nextStartDate = date;
            nextStartId = id;
        }

        return {
            posts,
            hasMore: posts.length === pageSize,
            nextStartDate,
            nextStartId
        };
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

    /**
     * Rebuilds the feed index by creating feed entries for all existing posts
     * This is an idempotent operation that can be run multiple times
     * @returns {Promise<number>} - Number of posts indexed
     */
    async rebuildFeedIndex() {
        try {
            console.log('Starting feed index rebuild...');
            
            // Step 1: Delete all existing feed entries
            console.log('Deleting existing feed entries...');
            const feedEntries = await this.query('FEED');
            
            if (feedEntries.length > 0) {
                console.log(`Found ${feedEntries.length} existing feed entries to delete`);
                await Promise.all(
                    feedEntries.map(entry => this.delete('FEED', entry.SK))
                );
                console.log('Deleted all existing feed entries');
            } else {
                console.log('No existing feed entries found');
            }
            
            // Step 2: Find all posts
            console.log('Finding all posts...');
            const params = {
                TableName: this.tableName,
                FilterExpression: 'SK = :sk',
                ExpressionAttributeValues: {
                    ':sk': 'DETAILS'
                }
            };
            
            const result = await this.dynamoDB.scan(params).promise();
            const posts = result.Items.map(item => new Post(item));
            console.log(`Found ${posts.length} posts to index`);
            
            // Step 3: Create feed entries for each post
            console.log('Creating new feed entries...');
            const feedEntryPromises = posts.map(post => {
                const createdAtISO = post.createdAt.toISOString();
                const feedEntry = {
                    PK: 'FEED',
                    SK: `${createdAtISO}#${post.id}`,
                    postId: post.id
                };
                return this.put(feedEntry);
            });
            
            await Promise.all(feedEntryPromises);
            console.log(`Successfully indexed ${posts.length} posts in the feed`);
            
            return posts.length;
        } catch (error) {
            console.error('Error rebuilding feed index:', error);
            throw error;
        }
    }
}

module.exports = new DynamoPostRepository(); 