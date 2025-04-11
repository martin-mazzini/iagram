const OpenAI = require('openai');
const axios = require('axios');
const S3ImageRepository = require('../../repositories/S3ImageRepository');

class OpenAIClient {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(prompt, options = {}) {
    const {
      model = process.env.OPENAI_MODEL,
      temperature = 0.7,
      max_tokens,
    } = options;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature,
        max_tokens: max_tokens || 150,
      });

      console.log('OpenAI Request:', {
        model,
        temperature,
        max_tokens,
        prompt: prompt.substring(0, 100) + '...'
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

  async generateImage(prompt) {
    try {
      // Add clear logging of the image prompt
      console.log('\n=== Generating image with OpenAI ===');
      console.log('Image prompt:', prompt);
      console.log('=======================================\n');

      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: `Create image given this description: ${prompt}.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      // Download and save the image to S3
      const imageUrl = response.data[0].url;
      return S3ImageRepository.saveImageFromUrl(imageUrl);
    } catch (error) {
      console.error('OpenAI Image Generation Error:', error);
      throw new Error('Failed to generate image');
    }
  }
}

module.exports = OpenAIClient; 