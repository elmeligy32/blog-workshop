import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

function resolvePending(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (!response || response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh");
    if (!refresh || config.url?.includes("/auth/token/refresh/")) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(client(config));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh });
      localStorage.setItem("access", data.access);
      resolvePending(data.access);
      config.headers.Authorization = `Bearer ${data.access}`;
      return client(config);
    } catch (refreshError) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      resolvePending(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;