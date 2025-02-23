const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

  async generateImage(prompt) {
    try {
      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: `Create a realistic, Instagram-worthy image of: ${prompt}. The image should be high quality and visually appealing, suitable for social media.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      // Download and save the image
      const imageUrl = response.data[0].url;
      const localPath = await this.downloadAndSaveImage(imageUrl);
      
      return localPath; // Return the local path where the image is saved
    } catch (error) {
      console.error('OpenAI Image Generation Error:', error);
      throw new Error('Failed to generate image');
    }
  }

  async downloadAndSaveImage(url) {
    try {
      // Create images directory if it doesn't exist
      const imagesDir = path.join(__dirname, '../../../public/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${Date.now()}.png`;
      const filepath = path.join(imagesDir, filename);

      // Download image
      const response = await axios({
        url,
        responseType: 'stream',
      });

      // Save to file
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(`/images/${filename}`));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      throw new Error('Failed to download and save image');
    }
  }
}

module.exports = OpenAIClient; 