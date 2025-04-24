const axios = require('axios');
const FormData = require('form-data');
const S3ImageRepository = require('../../repositories/S3ImageRepository');

class StabilityAIClient {
  constructor() {
    https://api.stability.ai/v2beta/stable-image/generate/sd3
    this.apiKey = process.env.STABILITY_API_KEY;
    this.apiUrl = "https://api.stability.ai";
    // Get the model URL from env (e.g., 'sd3' or 'ultra')
    this.modelUrl = process.env.STABILITY_MODEL_URL
    // Get the specific model for SD3 (only used if modelUrl is 'sd3')
    this.model = process.env.STABILITY_MODEL
  }

  async generateImage(prompt, key = null) {
    try {
      console.log('\n=== Generating image with Stability AI ===');
      console.log('Image prompt:', prompt);
      console.log('Model URL:', this.modelUrl);
      if (this.modelUrl === 'sd3') {
        console.log('SD3 Model:', this.model);
      }
      console.log('==========================================\n');
      
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

      // Add model parameter only for SD3
      if (this.modelUrl === 'sd3') {
        formData.append('model', this.model);
      }

      console.log('Sending request to Stability AI...');
      
      // Make request to Stability AI API using the configured endpoint
      const response = await axios.post(
        `${this.apiUrl}/v2beta/stable-image/generate/${this.modelUrl}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'image/*'
          },
          responseType: 'arraybuffer'
        }
      );

      console.log('Stability AI Response Status:', response.status);
      console.log('Stability AI Response Headers:', response.headers);
      
      if (!response.data) {
        throw new Error('No image data received from Stability AI API');
      }
      
      return S3ImageRepository.saveImage(response.data, 'image/png', key);
    } catch (error) {
      if (error.response) {
        console.error('Stability AI Error Response:', {
          status: error.response.status,
          headers: error.response.headers
        });
        
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
        console.error('Stability AI No Response:', error.request);
      } else {
        console.error('Stability AI Request Setup Error:', error.message);
      }
      
      throw new Error('Failed to generate image with Stability AI: ' + error.message);
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