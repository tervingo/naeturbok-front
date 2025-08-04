
class ApiService {
  async request(endpoint, options = {}) {
    const API_BASE_URL = 'https://naeturbok-back.onrender.com';
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Records endpoints
  async getRecords(startDate = null, endDate = null) {
    let endpoint = '/records';
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.request(endpoint);
  }

  async getRecord(id) {
    return this.request(`/records/${id}`);
  }

  async createRecord(recordData) {
    return this.request('/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  async updateRecord(id, recordData) {
    return this.request(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData),
    });
  }

  async deleteRecord(id) {
    return this.request(`/records/${id}`, {
      method: 'DELETE',
    });
  }

  async healthCheck() {
    return this.request('/health');
  }
}

const apiService = new ApiService();
export default apiService;