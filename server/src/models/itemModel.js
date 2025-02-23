// Simple in-memory storage
const items = new Map();

const ItemModel = {
  addItem: (item) => {
    const id = Date.now().toString();
    items.set(id, { ...item, id });
    return { id, ...item };
  }
};

module.exports = ItemModel; 