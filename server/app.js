console.log("Current directory:", process.cwd());
const path = require('path');
const result = require('dotenv').config();
console.log("Dotenv result:", result);
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);


const app = require('./src/app');


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 