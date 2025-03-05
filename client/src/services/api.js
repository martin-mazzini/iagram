import axios from 'axios';

const api = {
  getPosts: async () => {
    try {
      const response = await axios.get('/api/posts');
      // Extract posts from the response object
      // The backend now returns { posts, hasMore, nextStartDate, nextStartId }
      return response.data.posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }
};

export default api; 