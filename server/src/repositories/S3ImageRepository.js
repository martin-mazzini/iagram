const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class S3ImageRepository {
    constructor() {
        // Configure AWS S3 client
        this.s3 = new AWS.S3({
            endpoint: process.env.S3_ENDPOINT || 'http://localstack:4566',
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
            s3ForcePathStyle: true, // Required for localstack
            sslEnabled: false
        });

        this.bucketName = process.env.S3_BUCKET_NAME || 'images';
    }

    async initialize() {
        try {
            // Check if bucket exists
            await this.s3.headBucket({ Bucket: this.bucketName }).promise();
            console.log(`S3 bucket ${this.bucketName} already exists`);
        } catch (error) {
            if (error.statusCode === 404) {
                // Bucket doesn't exist, create it
                await this.s3.createBucket({ Bucket: this.bucketName }).promise();
                console.log(`Created S3 bucket ${this.bucketName}`);
            } else {
                throw error;
            }
        }
    }

    async saveImage(buffer, contentType = 'image/png') {
        try {
            const key = `${uuidv4()}.png`;
            
            await this.s3.putObject({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType
            }).promise();

            // Return the URL to access the image
            return `/images/${key}`;
        } catch (error) {
            console.error('Error saving image to S3:', error);
            throw new Error('Failed to save image to S3');
        }
    }

    async saveImageFromUrl(url) {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            return this.saveImage(Buffer.from(buffer), response.headers.get('content-type'));
        } catch (error) {
            console.error('Error saving image from URL:', error);
            throw new Error('Failed to save image from URL');
        }
    }

    async saveBase64Image(base64Data) {
        try {
            // Remove data URL prefix if present
            const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Image, 'base64');
            return this.saveImage(buffer);
        } catch (error) {
            console.error('Error saving base64 image:', error);
            throw new Error('Failed to save base64 image');
        }
    }
}

module.exports = new S3ImageRepository(); 