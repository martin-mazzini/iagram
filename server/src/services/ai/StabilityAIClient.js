const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class StabilityAIClient {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    // We need to use the v2beta base URL for Stable Image Ultra
    this.apiUrl = "https://api.stability.ai";
  }

  async generateImage(prompt) {
    try {
      console.log('Generating image with Stability AI, prompt:', prompt.substring(0, 100) + '...');
      
      // Create a FormData instance for multipart/form-data
      const formData = new FormData();
      
      // Add the prompt parameter
      formData.append('prompt', prompt);
      
      // Add other parameters
      formData.append('width', '1024');
      formData.append('height', '1024');
      formData.append('steps', '30');
      formData.append('seed', '0');
      formData.append('cfg_scale', '7');

      console.log('Sending request to Stability AI...');
      
      // Make request to Stability AI API using the correct v2beta endpoint
      // Set responseType to 'arraybuffer' to get the raw image data
      const response = await axios.post(
        `${this.apiUrl}/v2beta/stable-image/generate/ultra`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.apiKey}`,
            // Request the image directly instead of JSON
            'Accept': 'image/*'
          },
          responseType: 'arraybuffer' // Important: get the raw binary data
        }
      );

      console.log('Stability AI Response Status:', response.status);
      console.log('Stability AI Response Headers:', response.headers);
      
      // The entire response is the image data
      if (!response.data) {
        throw new Error('No image data received from Stability AI API');
      }
      
      // Save the binary image data
      const localPath = await this.saveBinaryImage(response.data);
      
      return localPath;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Stability AI Error Response:', {
          status: error.response.status,
          headers: error.response.headers
        });
        
        // If we have binary data in the error response, it might be an error message in JSON
        if (error.response.data) {
          try {
            const errorText = Buffer.from(error.response.data).toString('utf8');
            console.error('Error response data:', errorText);
            try {
              const errorJson = JSON.parse(errorText);
              console.error('Parsed error:', errorJson);
            } catch (e) {
              // Not JSON, just log the text
            }
          } catch (e) {
            console.error('Could not parse error response');
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Stability AI No Response:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Stability AI Request Setup Error:', error.message);
      }
      
      throw new Error('Failed to generate image with Stability AI: ' + error.message);
    }
  }

  async saveBinaryImage(binaryData) {
    try {
      // Create images directory if it doesn't exist
      const imagesDir = path.join(__dirname, '../../../public/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${Date.now()}.png`;
      const filepath = path.join(imagesDir, filename);
      
      // Write the binary data directly to file
      fs.writeFileSync(filepath, Buffer.from(binaryData));
      
      return `/images/${filename}`;
    } catch (error) {
      console.error('Error saving binary image:', error);
      throw new Error('Failed to save binary image');
    }
  }

  // Keep this method for backward compatibility
  async saveBase64Image(base64Data) {
    try {
      // Create images directory if it doesn't exist
      const imagesDir = path.join(__dirname, '../../../public/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${Date.now()}.png`;
      const filepath = path.join(imagesDir, filename);

      // Remove data URL prefix if present
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      // Write the file
      fs.writeFileSync(filepath, Buffer.from(base64Image, 'base64'));
      
      return `/images/${filename}`;
    } catch (error) {
      console.error('Error saving base64 image:', error);
      throw new Error('Failed to save base64 image');
    }
  }
}

module.exports = StabilityAIClient; 