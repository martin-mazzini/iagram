import axios from 'axios';

const api = {
  getPosts: async (startDate = null, startId = null) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (startId) params.append('startId', startId);

      const response = await axios.get(`/api/posts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }
};

export default api; 