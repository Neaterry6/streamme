const axios = require("axios");

const BASE_URL = "https://api.qasimdev.dpdns.org";
const API_KEY = "qasim-dev";

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: { apikey: API_KEY }
});

module.exports = apiClient;