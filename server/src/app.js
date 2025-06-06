const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const { router: postRoutes, getAllPosts } = require('./routes/postRoutes');
const path = require('path');
const { createTable } = require('./config/dynamodb');
const S3ImageRepository = require('./repositories/S3ImageRepository');

const isLocal = process.argv.includes('--local');

const app = express();

app.use(cors());
app.use(express.json());


async function initializeServices() {
    try {
        await createTable();
        await S3ImageRepository.initialize();
        console.log('Services initialized successfully');
    } catch (error) {
        console.error('Error initializing services:', error);
        throw error;
    }
}

initializeServices()
    .then(() => {
        if (process.env.ENABLE_DEV_ENDPOINTS === 'true') {
            app.use('/api/ai', aiRoutes);
            app.use('/api/users', userRoutes);
            app.use('/api/posts', postRoutes);
        } else {
            // In production, only expose the GET /posts endpoint
            app.get('/api/posts', getAllPosts);
        }
        
        // S3 proxy for images
        app.use('/images', (req, res) => {
            const key = req.path.substring(1); 
            const params = {
                Bucket: process.env.S3_BUCKET_NAME || 'images',
                Key: key
            };

            S3ImageRepository.s3.getObject(params)
                .createReadStream()
                .on('error', (error) => {
                    console.error('Error streaming image from S3:', error);
                    res.status(404).send('Image not found');
                })
                .pipe(res);
        });

        // Serve static files from the public directory
        app.use(express.static(path.join(__dirname, '../public')));

        // For any other routes, serve the index.html
        if (!isLocal) {
            app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../public/index.html'));
            });
        }

    })
    .catch(error => {
        console.error('Failed to initialize services:', error);
        process.exit(1);
    });

module.exports = app; 