const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

class S3ImageRepository {
    constructor() {
        // Base S3 configuration
        let config = {
            region: process.env.AWS_REGION || 'us-east-1',
        };

        // Add local development settings only in non-production
        if (process.env.ENVIRONMENT !== 'PRODUCTION') {
            config = {
                ...config,
                endpoint: process.env.S3_ENDPOINT || 'http://localstack:4566',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
                s3ForcePathStyle: true, // Required for localstack
                sslEnabled: false
            };
        }

        // Configure AWS S3 client
        this.s3 = new AWS.S3(config);
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

    async saveImage(buffer, contentType = 'image/png', key = null) {
        try {
            // Use provided key or generate a random one
            const imageKey = key ? `${key}.webp` : `${uuidv4()}.webp`;
            
            console.log('\n=== Processing image for S3 ===');
            console.log('Key:', imageKey);
            console.log('Bucket:', this.bucketName);
            
            // Process image with Sharp
            const processedBuffer = await sharp(buffer)
                .webp({ quality: 85 }) // Convert to WebP with 85% quality
                .toBuffer();
            
            console.log('Image processed successfully');
            console.log('==========================================\n');
            
            await this.s3.putObject({
                Bucket: this.bucketName,
                Key: imageKey,
                Body: processedBuffer,
                ContentType: 'image/webp'
            }).promise();

            console.log('\n=== Successfully saved to S3 ===');
            console.log('Key:', imageKey);
            console.log('Bucket:', this.bucketName);
            console.log('==========================================\n');

            // Return the URL to access the image
            return `/images/${imageKey}`;
        } catch (error) {
            console.error('Error saving image to S3:', error);
            throw new Error('Failed to save image to S3');
        }
    }

    async saveImageFromUrl(url, key = null) {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            return this.saveImage(Buffer.from(buffer), response.headers.get('content-type'), key);
        } catch (error) {
            console.error('Error saving image from URL:', error);
            throw new Error('Failed to save image from URL');
        }
    }

    async saveBase64Image(base64Data, key = null) {
        try {
            // Remove data URL prefix if present
            const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Image, 'base64');
            return this.saveImage(buffer, 'image/png', key);
        } catch (error) {
            console.error('Error saving base64 image:', error);
            throw new Error('Failed to save base64 image');
        }
    }
}

module.exports = new S3ImageRepository(); 