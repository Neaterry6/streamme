// backend/utils/apiClient.js
const axios = require("axios");

const BASE_URL = "https://api.qasimdev.dpdns.org";
const API_KEY = process.env.QASIM_API_KEY || "qasim-dev";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// Helper to call endpoints with API key
async function fetchEndpoint(endpoint, params = {}) {
  const response = await apiClient.get(endpoint, {
    params: { ...params, apikey: API_KEY }
  });
  return response.data;
}

module.exports = { fetchEndpoint };
