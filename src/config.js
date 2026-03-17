// Nyapui Radio - API Configuration
// This enables dynamic switching between local development and production environments.

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://nyapui-radio-api.onrender.com' 
  : ''; // In development, the proxy in package.json handles this

export default API_URL;
