import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // ⬅ API running on port 3000
  timeout: 8000,
});

// Optional interceptors
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
