const hostname = window.location.hostname;

export const API_URL =
  hostname === "10.0.2.2"
    ? "http://10.0.2.2:8000"
    : import.meta.env.VITE_API_URL || "https://api.ebookpackstore.com";

export default API_URL;
