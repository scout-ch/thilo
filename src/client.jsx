import axios from "axios";

export default axios.create({
  // read baseULR for dev from .env file, for production from window.env (set by webpack)
  baseURL: process.env.REACT_APP_BACKEND_URL || window.env.BACKEND_URL || 'https://strapi.app.levell.ch/',
  headers: {
    "Content-type": "application/json",
  },
});
