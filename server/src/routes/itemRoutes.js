const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.post('/', itemController.addItem);
router.get('/', itemController.getItem);


module.exports = router; 