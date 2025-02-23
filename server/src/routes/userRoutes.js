const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');

router.get('/', (req, res) => {
    const users = UserRepository.findAll();
    res.json(users);
});

module.exports = router; 