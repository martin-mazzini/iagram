const OpenAIClient = require('../services/ai/OpenAIClient');

const aiClient = new OpenAIClient();

const aiController = {
  generateResponse: async (req, res) => {
    try {
      const { prompt } = req.query;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const response = await aiClient.generateResponse(prompt);
      
      // Log the response
      console.log('AI Response:', response);
      
      res.status(200).json(response);
    } catch (error) {
      console.error('AI Controller Error:', error);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  }
};

module.exports = aiController; 