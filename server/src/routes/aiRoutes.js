const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/generate', aiController.generateResponse);

module.exports = router; 