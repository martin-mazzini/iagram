const ItemModel = require('../models/itemModel');

const itemController = {
  addItem: (req, res) => {
    try {
      const newItem = ItemModel.addItem(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getItem: (req, res) => {
    console.log('Item retrieved');
    res.status(200).json({ message: 'Item retrieved' });
  }
};

module.exports = itemController; 