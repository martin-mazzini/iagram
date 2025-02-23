const OpenAI = require('openai');


class OpenAIClient {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(prompt, options = {}) {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens = 150,
    } = options;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature,
        max_tokens,
      });

      return {
        content: completion.choices[0].message.content,
        usage: completion.usage,
        model: completion.model,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

module.exports = OpenAIClient; 